import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import type {
	Game,
	Rubber,
	Tie,
	TieWithDetails,
} from "@/hooks/use-public-queries";
import { supabase } from "@/lib/supabase";

type TournamentData = {
	ties: Tie[];
	rubbers: Rubber[];
	[key: string]: unknown;
};
type ScoringData = {
	rubber: Rubber;
	tie: Tie | null;
	games: Game[];
	[key: string]: unknown;
};
type Scope =
	| { kind: "home" }
	| { kind: "tournament"; tournamentId: string }
	| { kind: "tie"; tieId: string }
	| { kind: "scoring"; tieId: string; rubberId: string };
type Row = Tie | Rubber | Game;
type Table = "ties" | "rubbers" | "games";

// Channel names only need to be unique within this client, not cryptographically random.
let channelSequence = 0;

function replaceRow<T extends { id: string }>(items: T[], row: T): T[] {
	const index = items.findIndex((item) => item.id === row.id);
	if (index === -1) return [...items, row];
	return items.map((item) => (item.id === row.id ? { ...item, ...row } : item));
}

/** Subscribe only while the relevant page is mounted. RLS remains authoritative. */
export function useRealtime(scope: Scope | null) {
	const client = useQueryClient();
	const kind = scope?.kind;
	const tournamentId =
		scope?.kind === "tournament" ? scope.tournamentId : undefined;
	const tieId =
		scope?.kind === "tie" || scope?.kind === "scoring"
			? scope.tieId
			: undefined;
	const rubberId = scope?.kind === "scoring" ? scope.rubberId : undefined;
	const [connected, setConnected] = React.useState(false);
	React.useEffect(() => {
		if (!kind) {
			setConnected(false);
			return;
		}
		let active = true;
		let subscribed = false;
		setConnected(false);
		const sync = () => {
			if (kind === "home")
				void client.invalidateQueries({ queryKey: ["public", "tournaments"] });
			if (kind === "tournament")
				void client.invalidateQueries({
					queryKey: ["public", "tournament-data", tournamentId],
				});
			if (kind === "tie")
				void client.invalidateQueries({
					queryKey: ["public", "tie-details", tieId],
				});
			if (kind === "scoring")
				void client.invalidateQueries({ queryKey: ["scoring", rubberId] });
		};
		const handle = (table: Table, event: string, row: Row | null) => {
			if (!active) return;
			if (event === "DELETE" || !row) {
				sync();
				return;
			}
			if (kind === "home") {
				sync();
				return;
			}
			if (kind === "tournament") {
				if (table === "ties")
					client.setQueryData<TournamentData>(
						["public", "tournament-data", tournamentId],
						(old) => old && { ...old, ties: replaceRow(old.ties, row as Tie) },
					);
				if (table === "rubbers")
					client.setQueryData<TournamentData>(
						["public", "tournament-data", tournamentId],
						(old) =>
							old && {
								...old,
								rubbers: replaceRow(old.rubbers, row as Rubber),
							},
					);
				// Standings are derived in the database, not present in the event.
				if (table === "ties" && (row as Tie).status === "finished") sync();
			}
			if (kind === "tie")
				client.setQueryData<TieWithDetails | null>(
					["public", "tie-details", tieId],
					(old) => {
						if (!old) return old;
						if (table === "ties") return { ...old, ...(row as Tie) };
						if (table === "rubbers")
							return {
								...old,
								rubbers: old.rubbers.map((r) =>
									r.id === row.id ? { ...r, ...(row as Rubber) } : r,
								),
							};
						const game = row as Game;
						return {
							...old,
							rubbers: old.rubbers.map((r) =>
								r.id === game.rubber_id
									? {
											...r,
											games: replaceRow(r.games, game).sort(
												(a, b) => a.game_no - b.game_no,
											),
										}
									: r,
							),
						};
					},
				);
			if (kind === "scoring") {
				if (table === "rubbers" && row.id === rubberId) {
					const rubber = row as Rubber;
					client.setQueriesData<ScoringData>(
						{ queryKey: ["scoring", rubberId] },
						(old) => old && { ...old, rubber },
					);
					// Assignment may have changed; revalidate the token before displaying further data.
					sync();
				} else if (table === "ties")
					client.setQueriesData<ScoringData>(
						{ queryKey: ["scoring", rubberId] },
						(old) => old && { ...old, tie: row as Tie },
					);
				else if (table === "games" && (row as Game).rubber_id === rubberId)
					client.setQueriesData<ScoringData>(
						{ queryKey: ["scoring", rubberId] },
						(old) =>
							old && {
								...old,
								games: replaceRow(old.games, row as Game).sort(
									(a, b) => a.game_no - b.game_no,
								),
							},
					);
			}
		};
		const channel = supabase.channel(
			`m5:${kind}:${tournamentId ?? tieId ?? "all"}:${Date.now()}-${++channelSequence}`,
		);
		const tieFilter =
			kind === "home"
				? undefined
				: kind === "tournament"
					? `tournament_id=eq.${tournamentId}`
					: `id=eq.${tieId}`;
		channel.on(
			"postgres_changes",
			{
				event: "*",
				schema: "public",
				table: "ties",
				...(tieFilter ? { filter: tieFilter } : {}),
			},
			(payload) =>
				handle(
					"ties",
					payload.eventType,
					payload.eventType === "DELETE" ? null : (payload.new as Tie),
				),
		);
		if (kind !== "home") {
			const filter =
				kind === "tournament"
					? `tournament_id=eq.${tournamentId}`
					: `tie_id=eq.${tieId}`;
			channel.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "rubbers", filter },
				(payload) =>
					handle(
						"rubbers",
						payload.eventType,
						payload.eventType === "DELETE" ? null : (payload.new as Rubber),
					),
			);
			if (kind !== "tournament")
				channel.on(
					"postgres_changes",
					{ event: "*", schema: "public", table: "games", filter },
					(payload) =>
						handle(
							"games",
							payload.eventType,
							payload.eventType === "DELETE" ? null : (payload.new as Game),
						),
				);
		}
		channel.subscribe((status) => {
			if (!active) return;
			if (status === "SUBSCRIBED") {
				setConnected(navigator.onLine);
				subscribed = true;
				sync();
			} else if (
				status === "CHANNEL_ERROR" ||
				status === "TIMED_OUT" ||
				status === "CLOSED"
			) {
				subscribed = false;
				setConnected(false);
			}
		});
		const focus = () => {
			if (document.visibilityState === "visible") sync();
		};
		const online = () => {
			setConnected(subscribed && navigator.onLine);
			if (navigator.onLine) sync();
		};
		window.addEventListener("focus", focus);
		window.addEventListener("online", online);
		window.addEventListener("offline", online);
		document.addEventListener("visibilitychange", focus);
		return () => {
			active = false;
			window.removeEventListener("focus", focus);
			window.removeEventListener("online", online);
			window.removeEventListener("offline", online);
			document.removeEventListener("visibilitychange", focus);
			void supabase.removeChannel(channel);
		};
	}, [client, kind, tournamentId, tieId, rubberId]);
	return connected;
}
