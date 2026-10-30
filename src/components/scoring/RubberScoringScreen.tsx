import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, WifiOffIcon } from "lucide-react";
import * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Rubber = Database["public"]["Tables"]["rubbers"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"];
type Side = Database["public"]["Enums"]["side"];

export function RubberScoringScreen({
	rubberId,
	token,
	backTo,
}: {
	rubberId: string;
	token?: string;
	backTo: "referee" | "admin";
}) {
	const queryClient = useQueryClient();
	const [online, setOnline] = React.useState(
		typeof navigator === "undefined" ? true : navigator.onLine,
	);
	const [endDialog, setEndDialog] = React.useState(false);
	const [earlyWinner, setEarlyWinner] = React.useState<Side>("a");
	const [busy, setBusy] = React.useState(false);
	const [optimistic, setOptimistic] = React.useState<{
		gameNo: number;
		a: number;
		b: number;
	} | null>(null);
	const lastTap = React.useRef<Record<Side, number>>({ a: 0, b: 0 });
	const previousGameNo = React.useRef<number | null>(null);
	const [gameBanner, setGameBanner] = React.useState("");

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["scoring", rubberId, Boolean(token)],
		queryFn: async () => {
			let refereeId: string | null = null;
			if (token) {
				const { data: who, error: whoError } = await supabase.rpc(
					"referee_whoami",
					{ p_token: token },
				);
				if (whoError) {
					if (whoError.message.includes("invalid_token")) return null;
					throw whoError;
				}
				if (!who?.[0]) return null;
				refereeId = who[0].referee_id;
			}
			let rubberQuery = supabase.from("rubbers").select("*").eq("id", rubberId);
			if (refereeId) rubberQuery = rubberQuery.eq("referee_id", refereeId);
			const { data: rubber, error: rubberError } =
				await rubberQuery.maybeSingle();
			if (rubberError) throw rubberError;
			if (!rubber) return null;
			const [tieRes, gamesRes, lineupRes, teamsRes] = await Promise.all([
				supabase.from("ties").select("*").eq("id", rubber.tie_id).maybeSingle(),
				supabase
					.from("games")
					.select("*")
					.eq("rubber_id", rubberId)
					.order("game_no"),
				supabase
					.from("rubber_players")
					.select("side, player:players(full_name)")
					.eq("rubber_id", rubberId),
				supabase
					.from("teams")
					.select("id,name,short_name")
					.eq("tournament_id", rubber.tournament_id),
			]);
			if (tieRes.error) throw tieRes.error;
			if (gamesRes.error) throw gamesRes.error;
			if (lineupRes.error) throw lineupRes.error;
			if (teamsRes.error) throw teamsRes.error;
			const tie = tieRes.data;
			const teams = teamsRes.data ?? [];
			const names = (side: Side) =>
				(lineupRes.data ?? [])
					.filter((item) => item.side === side)
					.map(
						(item) => (item.player as { full_name: string } | null)?.full_name,
					)
					.filter((name): name is string => Boolean(name));
			return {
				rubber: rubber as Rubber,
				tie,
				games: (gamesRes.data ?? []) as Game[],
				teamA:
					teams.find((team) => team.id === tie?.team_a_id)?.name ?? "Đội A",
				teamB:
					teams.find((team) => team.id === tie?.team_b_id)?.name ?? "Đội B",
				playersA: names("a"),
				playersB: names("b"),
			};
		},
		refetchInterval: 2_000,
	});

	React.useEffect(() => {
		const update = () => setOnline(navigator.onLine);
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);

	React.useEffect(() => {
		if (data?.rubber.status !== "live") return;
		type ScreenLock = { release: () => Promise<void> };
		const nav = navigator as Navigator & {
			wakeLock?: { request: (type: "screen") => Promise<ScreenLock> };
		};
		let lock: ScreenLock | null = null;
		let cancelled = false;
		const release = () => {
			const held = lock;
			lock = null;
			if (held) void held.release();
		};
		const acquire = async () => {
			if (
				cancelled ||
				!navigator.onLine ||
				document.visibilityState !== "visible" ||
				!nav.wakeLock ||
				lock
			)
				return;
			try {
				const requested = await nav.wakeLock.request("screen");
				if (cancelled || document.visibilityState !== "visible")
					void requested.release();
				else lock = requested;
			} catch {
				/* Wake lock is optional and can be denied by the browser. */
			}
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") void acquire();
			else release();
		};
		void acquire();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelled = true;
			document.removeEventListener("visibilitychange", onVisibility);
			release();
		};
	}, [data?.rubber.status]);

	const currentGame = data?.games.find(
		(game) => game.game_no === data.rubber.current_game,
	);
	React.useEffect(() => {
		const gameNo = data?.rubber.current_game;
		if (!gameNo) return;
		if (previousGameNo.current !== null && gameNo > previousGameNo.current) {
			const previousGame = data?.games.find(
				(game) => game.game_no === previousGameNo.current,
			);
			const winnerName =
				previousGame?.winner_side === "a"
					? data?.teamA
					: previousGame?.winner_side === "b"
						? data?.teamB
						: null;
			setGameBanner(
				`Đã kết thúc ván ${previousGameNo.current}${winnerName ? ` · ${winnerName} thắng` : ""}`,
			);
			const timer = window.setTimeout(() => setGameBanner(""), 3_000);
			previousGameNo.current = gameNo;
			return () => window.clearTimeout(timer);
		}
		previousGameNo.current = gameNo;
	}, [data?.rubber.current_game, data?.games, data?.teamA, data?.teamB]);

	const score =
		optimistic && optimistic.gameNo === currentGame?.game_no
			? { a: optimistic.a, b: optimistic.b }
			: { a: currentGame?.score_a ?? 0, b: currentGame?.score_b ?? 0 };
	const kindLabel =
		data?.rubber.kind === "singles"
			? "Đơn"
			: data?.rubber.kind === "mixed_doubles"
				? "Đôi nam nữ"
				: "Đôi";
	const lineupReady =
		Boolean(data?.tie?.team_a_id && data?.tie?.team_b_id) &&
		Boolean(data) &&
		data?.playersA.length === (data?.rubber.kind === "singles" ? 1 : 2) &&
		data?.playersB.length === (data?.rubber.kind === "singles" ? 1 : 2);
	const canScore = data?.rubber.status === "live" && !busy && online;

	const act = async (action: "score" | "undo", side: Side) => {
		if (!data || !online || busy) return;
		const now = Date.now();
		if (action === "score" && now - lastTap.current[side] < 250) return;
		if (action === "score") lastTap.current[side] = now;
		if (action === "undo" && score[side] < 1) return;
		const next = {
			...score,
			[side]: score[side] + (action === "score" ? 1 : -1),
		};
		setOptimistic({
			gameNo: currentGame?.game_no ?? data.rubber.current_game,
			...next,
		});
		setBusy(true);
		if (action === "score") navigator.vibrate?.(15);
		try {
			const { error: rpcError } = await supabase.rpc(
				action === "score" ? "score_point" : "undo_point",
				{
					p_rubber_id: rubberId,
					p_side: side,
					...(token ? { p_token: token } : {}),
				},
			);
			if (rpcError) throw rpcError;
			await queryClient.invalidateQueries({ queryKey: ["scoring", rubberId] });
			await refetch();
			setOptimistic(null);
		} catch (err) {
			setOptimistic(null);
			await refetch();
			showRpcError(err);
		} finally {
			setBusy(false);
		}
	};

	const start = async () => {
		if (!data || !online) return;
		setBusy(true);
		try {
			const { error: rpcError } = await supabase.rpc("start_rubber", {
				p_rubber_id: rubberId,
				...(token ? { p_token: token } : {}),
			});
			if (rpcError) throw rpcError;
			toastSuccess("Đã bắt đầu trận đấu.");
			await refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setBusy(false);
		}
	};

	const finishEarly = async (winner: Side) => {
		if (!data || !online) return;
		setBusy(true);
		try {
			const { error: rpcError } = await supabase.rpc("end_rubber_early", {
				p_rubber_id: rubberId,
				p_winner_side: winner,
				...(token ? { p_token: token } : {}),
			});
			if (rpcError) throw rpcError;
			setEndDialog(false);
			toastSuccess("Đã kết thúc trận đấu.");
			await refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setBusy(false);
		}
	};

	if (isLoading)
		return (
			<main className="mx-auto max-w-3xl p-6">
				<Card className="h-96 animate-pulse" />
			</main>
		);
	if (!data)
		return (
			<main className="mx-auto max-w-3xl p-6">
				<Card className="p-6 text-center">
					{error ? (
						<>
							<p>Không thể tải trận đấu. Vui lòng kiểm tra kết nối mạng.</p>
							<Button variant="outline" onClick={() => void refetch()}>
								Thử lại
							</Button>
						</>
					) : (
						"Không tìm thấy trận đấu hoặc bạn không có quyền xem trận này."
					)}
				</Card>
			</main>
		);
	const { rubber } = data;
	const gamesWon = `${rubber.games_won_a} – ${rubber.games_won_b}`;
	const backLink =
		backTo === "referee" ? (
			<Link to="/r/$token" params={{ token: token ?? "" }} />
		) : (
			<Link
				to="/admin/tournaments/$id/ties/$tieId"
				params={{ id: data.tie?.tournament_id ?? "", tieId: rubber.tie_id }}
			/>
		);

	return (
		<main className="mx-auto min-h-[75vh] max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
			<div className="mb-3 flex items-center justify-between gap-2">
				<Button variant="ghost" size="sm" render={backLink}>
					<ArrowLeftIcon /> Quay lại
				</Button>
				<div className="text-right">
					<div className="font-heading font-semibold">
						{kindLabel} {rubber.position} · {rubber.court || "Chưa xếp sân"}
					</div>
					<div className="text-xs text-muted-foreground">
						{data.tie?.round_label}
					</div>
				</div>
			</div>
			{!online && (
				<div
					role="alert"
					className="mb-3 flex items-center gap-2 border border-warning/40 bg-warning/10 p-3 text-sm text-warning"
				>
					<WifiOffIcon className="size-4" />
					Mất kết nối mạng. Điểm đang được giữ nguyên; thao tác chấm đã tạm
					khóa.
				</div>
			)}
			{gameBanner && (
				<output
					aria-live="polite"
					className="mb-3 bg-live/10 p-2 text-center text-sm font-semibold text-live"
				>
					{gameBanner}
				</output>
			)}
			<div className="mb-3 flex items-center justify-between">
				<Badge
					variant={
						rubber.status === "live"
							? "live"
							: rubber.status === "finished"
								? "win"
								: "outline"
					}
				>
					{rubber.status === "live"
						? "Đang thi đấu"
						: rubber.status === "finished"
							? "Đã kết thúc"
							: rubber.status === "skipped"
								? "Không thi đấu"
								: "Sắp diễn ra"}
				</Badge>
				<span className="text-sm font-mono">Số game: {gamesWon}</span>
			</div>
			{rubber.status === "scheduled" && (
				<Card className="space-y-4 p-5">
					<div className="grid grid-cols-2 gap-3 text-center">
						<div>
							<b>{data.teamA}</b>
							<p className="mt-1 text-sm text-muted-foreground">
								{data.playersA.join(" / ") || "Chưa có đội hình"}
							</p>
						</div>
						<div>
							<b>{data.teamB}</b>
							<p className="mt-1 text-sm text-muted-foreground">
								{data.playersB.join(" / ") || "Chưa có đội hình"}
							</p>
						</div>
					</div>
					{!lineupReady && (
						<p className="text-center text-sm text-warning">
							{!data.tie?.team_a_id || !data.tie?.team_b_id
								? "Chưa xác định đủ hai đội."
								: "Đội hình chưa đủ người."}
						</p>
					)}
					<Button
						size="xl"
						className="w-full"
						disabled={!lineupReady || busy || !online}
						onClick={start}
					>
						Bắt đầu trận
					</Button>
				</Card>
			)}
			{rubber.status === "live" && (
				<div className="grid gap-3">
					<div className="grid min-h-[38vh] grid-cols-2 gap-3">
						<ScoreSide
							side="a"
							name={data.teamA}
							players={data.playersA}
							score={score.a}
							disabled={!canScore}
							onClick={() => void act("score", "a")}
						/>
						<ScoreSide
							side="b"
							name={data.teamB}
							players={data.playersB}
							score={score.b}
							disabled={!canScore}
							onClick={() => void act("score", "b")}
						/>
					</div>
					<div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
						{data.games
							.filter((game) => game.winner_side)
							.map((game) => (
								<span key={game.id}>
									Ván {game.game_no}: {game.score_a}–{game.score_b}
								</span>
							))}
						{currentGame && (
							<span className="font-semibold text-foreground">
								Ván {currentGame.game_no}: {score.a}–{score.b}
							</span>
						)}
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Button
							size="xl"
							variant="outline"
							disabled={!canScore || score.a === 0}
							onClick={() => void act("undo", "a")}
						>
							Hoàn tác điểm A
						</Button>
						<Button
							size="xl"
							variant="outline"
							disabled={!canScore || score.b === 0}
							onClick={() => void act("undo", "b")}
						>
							Hoàn tác điểm B
						</Button>
					</div>
					<Button
						variant="destructive"
						className="justify-self-center"
						disabled={!online || busy}
						onClick={() => setEndDialog(true)}
					>
						Kết thúc sớm (bỏ cuộc / chấn thương)
					</Button>
				</div>
			)}
			{rubber.status === "finished" && (
				<Card className="space-y-3 p-6 text-center">
					<h1 className="font-heading text-xl font-bold">
						{rubber.end_reason === "walkover" ? "Xử thua" : "Kết quả trận đấu"}
					</h1>
					<p className="font-mono text-4xl font-bold">
						{rubber.winner_side === "a" ? data.teamA : data.teamB} thắng
					</p>
					<p className="text-sm text-muted-foreground">
						Số game: {gamesWon}
						{currentGame
							? ` · Ván cuối ${currentGame.score_a}–${currentGame.score_b}`
							: ""}
					</p>
					<Button variant="outline" render={backLink}>
						Quay lại
					</Button>
				</Card>
			)}
			{rubber.status === "skipped" && (
				<Card className="p-6 text-center text-muted-foreground">
					Trận này đã được bỏ qua.
				</Card>
			)}
			<AlertDialog open={endDialog} onOpenChange={setEndDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Kết thúc sớm</AlertDialogTitle>
						<AlertDialogDescription>
							Chọn phía thắng rồi xác nhận do chấn thương hoặc bỏ cuộc.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant={earlyWinner === "a" ? "default" : "outline"}
							disabled={busy || !online}
							onClick={() => setEarlyWinner("a")}
						>
							{data.teamA} thắng
						</Button>
						<Button
							variant={earlyWinner === "b" ? "default" : "outline"}
							disabled={busy || !online}
							onClick={() => setEarlyWinner("b")}
						>
							{data.teamB} thắng
						</Button>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={busy || !online}
							onClick={() => void finishEarly(earlyWinner)}
						>
							{busy ? "Đang xử lý..." : "Xác nhận kết thúc"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}

function ScoreSide({
	side,
	name,
	players,
	score,
	disabled,
	onClick,
}: {
	side: Side;
	name: string;
	players: string[];
	score: number;
	disabled: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-label={`Cộng điểm cho ${name}`}
			className={cn(
				"flex min-h-0 flex-col items-center justify-center gap-2 border-2 p-3 text-center transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70",
				side === "a"
					? "border-team-a bg-team-a/10"
					: "border-team-b bg-team-b/10",
			)}
		>
			<span className="text-xs font-bold uppercase tracking-wide">
				{side === "a" ? "Đội A" : "Đội B"}
			</span>
			<span className="font-heading text-lg font-bold leading-tight sm:text-2xl">
				{name}
			</span>
			<span className="text-xs text-muted-foreground">
				{players.join(" / ")}
			</span>
			<span className="font-mono text-7xl font-extrabold tabular-nums sm:text-9xl">
				{score}
			</span>
		</button>
	);
}
