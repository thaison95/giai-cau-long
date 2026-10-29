import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Group = Database["public"]["Tables"]["tournament_groups"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Tie = Database["public"]["Tables"]["ties"]["Row"];
export type Rubber = Database["public"]["Tables"]["rubbers"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type RubberPlayer =
	Database["public"]["Tables"]["rubber_players"]["Row"];
export type GroupStanding =
	Database["public"]["Views"]["group_standings"]["Row"];

export interface PublicTournamentItem extends Tournament {
	has_live_tie?: boolean;
	team_count?: number;
}

/**
 * Hook lấy danh sách giải công khai (published hoặc finished).
 * Sắp xếp: Đang diễn ra (có trận live hoặc trong thời gian diễn ra) -> Sắp tới -> Đã kết thúc.
 */
export function usePublicTournaments() {
	return useQuery({
		queryKey: ["public", "tournaments"],
		queryFn: async (): Promise<PublicTournamentItem[]> => {
			const { data: tournaments, error: tourneyError } = await supabase
				.from("tournaments")
				.select("*")
				.in("status", ["published", "finished"])
				.order("start_date", { ascending: false, nullsFirst: false });

			if (tourneyError) throw tourneyError;
			if (!tournaments || tournaments.length === 0) return [];

			const tournamentIds = tournaments.map((t) => t.id);

			// Lấy danh sách các tie đang 'live' để hiển thị badge TRỰC TIẾP
			const { data: liveTies } = await supabase
				.from("ties")
				.select("tournament_id")
				.eq("status", "live")
				.in("tournament_id", tournamentIds);

			const liveTournamentSet = new Set(
				(liveTies ?? []).map((t) => t.tournament_id),
			);

			// Lấy số lượng đội tham gia từng giải
			const { data: teamsData } = await supabase
				.from("teams")
				.select("tournament_id")
				.in("tournament_id", tournamentIds);

			const teamCountMap = new Map<string, number>();
			for (const team of teamsData ?? []) {
				teamCountMap.set(
					team.tournament_id,
					(teamCountMap.get(team.tournament_id) ?? 0) + 1,
				);
			}

			const now = new Date();
			const todayStr = now.toISOString().slice(0, 10);

			const items: PublicTournamentItem[] = tournaments.map((t) => ({
				...t,
				has_live_tie: liveTournamentSet.has(t.id),
				team_count: teamCountMap.get(t.id) ?? 0,
			}));

			// Sắp xếp:
			// 1. Đang diễn ra: có trận live hoặc (status === 'published' và start_date <= today <= end_date)
			// 2. Sắp tới: status === 'published' và start_date > today
			// 3. Đã kết thúc: status === 'finished' hoặc end_date < today
			return items.sort((a, b) => {
				const isALive =
					a.has_live_tie ||
					(a.status === "published" &&
						(!a.start_date || a.start_date <= todayStr) &&
						(!a.end_date || a.end_date >= todayStr));
				const isBLive =
					b.has_live_tie ||
					(b.status === "published" &&
						(!b.start_date || b.start_date <= todayStr) &&
						(!b.end_date || b.end_date >= todayStr));

				if (isALive && !isBLive) return -1;
				if (!isALive && isBLive) return 1;

				const isAFinished =
					a.status === "finished" ||
					(typeof a.end_date === "string" && a.end_date < todayStr);
				const isBFinished =
					b.status === "finished" ||
					(typeof b.end_date === "string" && b.end_date < todayStr);

				if (!isAFinished && isBFinished) return -1;
				if (isAFinished && !isBFinished) return 1;

				// Cùng nhóm: sắp xếp theo start_date gần nhất
				const dateA = a.start_date || a.created_at;
				const dateB = b.start_date || b.created_at;
				return dateB.localeCompare(dateA);
			});
		},
		staleTime: 10_000,
	});
}

/**
 * Hook lấy chi tiết giải đấu theo slug.
 * Trả về null nếu không tìm thấy hoặc giải ở trạng thái 'draft' (không tiết lộ sự tồn tại của giải draft).
 */
export function usePublicTournament(slug: string) {
	return useQuery({
		queryKey: ["public", "tournament", slug],
		queryFn: async (): Promise<Tournament | null> => {
			if (!slug) return null;
			const { data, error } = await supabase
				.from("tournaments")
				.select("*")
				.eq("slug", slug)
				.in("status", ["published", "finished"])
				.maybeSingle();

			if (error) {
				console.error("Error fetching tournament by slug:", error);
				return null;
			}
			return data as Tournament | null;
		},
		staleTime: 15_000,
	});
}

/**
 * Hook lấy dữ liệu tổng hợp cho trang giải đấu:
 * Đội, bảng đấu, VĐV, ties, rubbers, standings.
 */
export function usePublicTournamentData(tournamentId?: string) {
	return useQuery({
		queryKey: ["public", "tournament-data", tournamentId],
		enabled: Boolean(tournamentId),
		queryFn: async () => {
			if (!tournamentId) throw new Error("Missing tournamentId");

			const [
				groupsRes,
				teamsRes,
				playersRes,
				tiesRes,
				rubbersRes,
				standingsRes,
			] = await Promise.all([
				supabase
					.from("tournament_groups")
					.select("*")
					.eq("tournament_id", tournamentId)
					.order("sort_order", { ascending: true })
					.order("name", { ascending: true }),
				supabase
					.from("teams")
					.select("*")
					.eq("tournament_id", tournamentId)
					.order("seed", { ascending: true, nullsFirst: false })
					.order("name", { ascending: true }),
				supabase
					.from("players")
					.select("*")
					.eq("tournament_id", tournamentId)
					.order("sort_order", { ascending: true })
					.order("full_name", { ascending: true }),
				supabase
					.from("ties")
					.select("*")
					.eq("tournament_id", tournamentId)
					.order("round_order", { ascending: true })
					.order("scheduled_at", { ascending: true, nullsFirst: false })
					.order("created_at", { ascending: true }),
				supabase
					.from("rubbers")
					.select("*")
					.eq("tournament_id", tournamentId)
					.order("position", { ascending: true }),
				supabase
					.from("group_standings")
					.select("*")
					.eq("tournament_id", tournamentId),
			]);

			if (groupsRes.error) throw groupsRes.error;
			if (teamsRes.error) throw teamsRes.error;
			if (playersRes.error) throw playersRes.error;
			if (tiesRes.error) throw tiesRes.error;
			if (rubbersRes.error) throw rubbersRes.error;
			if (standingsRes.error) throw standingsRes.error;

			return {
				groups: (groupsRes.data ?? []) as Group[],
				teams: (teamsRes.data ?? []) as Team[],
				players: (playersRes.data ?? []) as Player[],
				ties: (tiesRes.data ?? []) as Tie[],
				rubbers: (rubbersRes.data ?? []) as Rubber[],
				standings: (standingsRes.data ?? []) as GroupStanding[],
			};
		},
		staleTime: 5_000,
	});
}

export interface RubberWithDetails extends Rubber {
	games: Game[];
	players_a: Player[];
	players_b: Player[];
}

export interface TieWithDetails extends Tie {
	team_a: Team | null;
	team_b: Team | null;
	rubbers: RubberWithDetails[];
}

/**
 * Hook lấy chi tiết một tie cùng tất cả rubbers, games, và rubber_players
 */
export function usePublicTieDetails(tieId?: string) {
	return useQuery({
		queryKey: ["public", "tie-details", tieId],
		enabled: Boolean(tieId),
		queryFn: async (): Promise<TieWithDetails | null> => {
			if (!tieId) return null;

			// 1. Lấy thông tin tie
			const { data: tie, error: tieError } = await supabase
				.from("ties")
				.select("*")
				.eq("id", tieId)
				.maybeSingle();

			if (tieError) throw tieError;
			if (!tie) return null;

			// 2. Lấy thông tin team A, team B, rubbers, games, rubber_players, players
			const [teamsRes, rubbersRes, gamesRes, rubberPlayersRes] =
				await Promise.all([
					supabase
						.from("teams")
						.select("*")
						.in(
							"id",
							[tie.team_a_id, tie.team_b_id].filter((id): id is string =>
								Boolean(id),
							),
						),
					supabase
						.from("rubbers")
						.select("*")
						.eq("tie_id", tieId)
						.order("position", { ascending: true }),
					supabase
						.from("games")
						.select("*")
						.eq("tie_id", tieId)
						.order("game_no", { ascending: true }),
					supabase
						.from("rubber_players")
						.select("*, player:players(*)")
						.eq("tournament_id", tie.tournament_id),
				]);

			if (teamsRes.error) throw teamsRes.error;
			if (rubbersRes.error) throw rubbersRes.error;
			if (gamesRes.error) throw gamesRes.error;

			const teams = teamsRes.data ?? [];
			const rubbers = rubbersRes.data ?? [];
			const games = gamesRes.data ?? [];
			const rubberPlayers = (rubberPlayersRes.data ?? []) as Array<
				RubberPlayer & { player: Player | null }
			>;

			const teamA = teams.find((t) => t.id === tie.team_a_id) ?? null;
			const teamB = teams.find((t) => t.id === tie.team_b_id) ?? null;

			// Gom games theo rubber_id
			const gamesByRubber = new Map<string, Game[]>();
			for (const g of games) {
				const list = gamesByRubber.get(g.rubber_id) ?? [];
				list.push(g);
				gamesByRubber.set(g.rubber_id, list);
			}

			// Gom rubber_players theo rubber_id và side
			const playersByRubberSide = new Map<
				string,
				{ a: Player[]; b: Player[] }
			>();
			for (const rp of rubberPlayers) {
				let container = playersByRubberSide.get(rp.rubber_id);
				if (!container) {
					container = { a: [], b: [] };
					playersByRubberSide.set(rp.rubber_id, container);
				}
				if (rp.player) {
					if (rp.side === "a") {
						container.a.push(rp.player);
					} else {
						container.b.push(rp.player);
					}
				}
			}

			const rubbersWithDetails: RubberWithDetails[] = rubbers.map((r) => {
				const ps = playersByRubberSide.get(r.id) ?? { a: [], b: [] };
				return {
					...r,
					games: (gamesByRubber.get(r.id) ?? []).sort(
						(g1, g2) => g1.game_no - g2.game_no,
					),
					players_a: ps.a.sort((p1, p2) => p1.sort_order - p2.sort_order),
					players_b: ps.b.sort((p1, p2) => p1.sort_order - p2.sort_order),
				};
			});

			return {
				...tie,
				team_a: teamA,
				team_b: teamB,
				rubbers: rubbersWithDetails,
			};
		},
		staleTime: 5_000,
	});
}
