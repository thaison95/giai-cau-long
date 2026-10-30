import { CheckIcon, MapPinIcon } from "lucide-react";
import * as React from "react";
import { LiveBadge } from "@/components/public/LiveBadge";
import { ScoreValue } from "@/components/public/ScoreValue";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { cn, formatDateTime } from "@/lib/utils";

type Rubber = Database["public"]["Tables"]["rubbers"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

interface RubberCardProps {
	rubber: Rubber & {
		games?: Game[];
		players_a?: Player[];
		players_b?: Player[];
	};
	teamAName?: string;
	teamBName?: string;
	playAllRubbers?: boolean;
	className?: string;
}

export function RubberCard({
	rubber,
	teamAName = "Đội A",
	teamBName = "Đội B",
	playAllRubbers = false,
	className,
}: RubberCardProps) {
	const isMixed = rubber.kind === "mixed_doubles";
	const isSkipped = rubber.status === "skipped";
	const isLive = rubber.status === "live";
	const isFinished = rubber.status === "finished";

	const kindLabel = React.useMemo(() => {
		if (isMixed) return "Đôi nam nữ";
		if (rubber.kind === "doubles") {
			// Thử suy luận đôi nam/đôi nữ nếu có giới tính
			const gendersA = rubber.players_a?.map((p) => p.gender).filter(Boolean);
			if (gendersA && gendersA.length === 2) {
				if (gendersA.every((g) => g === "m")) return "Đôi nam";
				if (gendersA.every((g) => g === "f")) return "Đôi nữ";
			}
			return "Đôi";
		}
		if (rubber.kind === "singles") {
			const genderA = rubber.players_a?.[0]?.gender;
			if (genderA === "m") return "Đơn nam";
			if (genderA === "f") return "Đơn nữ";
			return "Đơn";
		}
		return rubber.kind;
	}, [rubber.kind, rubber.players_a, isMixed]);

	const games = [...(rubber.games ?? [])].sort(
		(g1, g2) => g1.game_no - g2.game_no,
	);

	const currentGame = games.find(
		(game) => game.game_no === rubber.current_game,
	);

	// Format danh sách tên VĐV
	const formatPlayerNames = (players?: Player[]) => {
		if (!players || players.length === 0) {
			return (
				<span className="italic text-muted-foreground/80">Chưa xếp VĐV</span>
			);
		}
		return (
			<span className="font-medium">
				{players.map((p) => p.full_name).join(" / ")}
			</span>
		);
	};

	return (
		<Card
			className={cn(
				"relative transition-all border p-3.5 md:p-4",
				isMixed
					? "border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]"
					: "bg-card border-border",
				isLive && "ring-1 ring-live/60 border-live/40 bg-live/[0.02]",
				isSkipped && "opacity-60 bg-muted/30 border-dashed",
				className,
			)}
		>
			{/* Top Bar: Position, Kind, Court, Time, Status */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-3 text-xs">
				<div className="flex items-center gap-2">
					<span className="font-heading font-semibold text-foreground text-xs md:text-sm">
						Trận {rubber.position}
					</span>

					{/* Badge loại trận */}
					{isMixed ? (
						<Badge
							variant="outline"
							className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
						>
							{kindLabel}
						</Badge>
					) : (
						<Badge variant="secondary" className="font-medium">
							{kindLabel}
						</Badge>
					)}

					{/* Court */}
					{rubber.court && (
						<span className="inline-flex items-center gap-1 text-muted-foreground font-medium text-xs">
							<MapPinIcon className="size-3 text-primary/70 shrink-0" />
							{rubber.court}
						</span>
					)}
				</div>

				<div className="flex items-center gap-2 ml-auto">
					{rubber.scheduled_at && !isLive && (
						<span className="text-[11px] text-muted-foreground font-mono">
							{formatDateTime(rubber.scheduled_at).slice(0, 5)}
						</span>
					)}

					{isLive && <LiveBadge />}
					{isFinished && (
						<Badge variant="win" className="gap-1 font-semibold text-[11px]">
							<CheckIcon className="size-3" />
							Đã xong
						</Badge>
					)}
					{isSkipped && (
						<Badge
							variant="secondary"
							className="line-through text-muted-foreground text-[11px]"
						>
							Không thi đấu
						</Badge>
					)}
					{rubber.status === "scheduled" && (
						<Badge
							variant="outline"
							className="text-muted-foreground text-[11px]"
						>
							Chưa đấu
						</Badge>
					)}
				</div>
			</div>

			{/* Main Matchup Body */}
			<div
				className={cn(
					"grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3",
					isSkipped && "line-through text-muted-foreground",
				)}
			>
				{/* Side A */}
				<div className="flex flex-col min-w-0 md:items-end">
					<div className="text-[11px] font-semibold text-team-a flex items-center gap-1.5 md:flex-row-reverse">
						<span>{teamAName}</span>
						{rubber.winner_side === "a" && (
							<CheckIcon className="size-3 text-win shrink-0" />
						)}
					</div>
					<div
						className={cn(
							"text-xs md:text-sm truncate mt-0.5",
							rubber.winner_side === "a" && "text-win font-semibold",
						)}
					>
						{formatPlayerNames(rubber.players_a)}
					</div>
				</div>

				{/* Center Score */}
				<div className="flex flex-col items-center justify-center px-2 py-1 bg-muted/40 rounded-none border border-border/40 min-w-[90px]">
					<div className="flex items-center gap-2 font-heading font-bold text-lg md:text-xl tabular-nums">
						<span
							className={cn(
								rubber.winner_side === "a" ? "text-win" : "text-team-a",
							)}
						>
							{rubber.games_won_a}
						</span>
						<span className="text-muted-foreground/40 font-normal">:</span>
						<span
							className={cn(
								rubber.winner_side === "b" ? "text-win" : "text-team-b",
							)}
						>
							{rubber.games_won_b}
						</span>
					</div>

					{isLive && games.length > 0 && (
						<span className="sr-only" aria-live="polite">
							{teamAName} {games[games.length - 1].score_a}, {teamBName}{" "}
							{games[games.length - 1].score_b}
						</span>
					)}

					{isLive && currentGame && (
						<div className="flex items-center gap-2 font-heading text-3xl font-bold tabular-nums">
							<ScoreValue value={currentGame.score_a} className="text-team-a" />
							<span aria-hidden="true" className="text-muted-foreground">
								–
							</span>
							<ScoreValue value={currentGame.score_b} className="text-team-b" />
						</div>
					)}

					{/* Điểm ván chi tiết */}
					{games.length > 0 && (
						<div className="flex flex-wrap items-center justify-center gap-1 mt-1 text-[10px] font-mono text-muted-foreground">
							{games.map((g) => (
								<span
									key={g.id}
									className={cn(
										"px-1 py-0.2 bg-background border border-border/60",
										g.winner_side === "a" && "text-team-a font-medium",
										g.winner_side === "b" && "text-team-b font-medium",
									)}
								>
									<ScoreValue value={g.score_a} />–
									<ScoreValue value={g.score_b} />
								</span>
							))}
						</div>
					)}
				</div>

				{/* Side B */}
				<div className="flex flex-col min-w-0 md:items-start">
					<div className="text-[11px] font-semibold text-team-b flex items-center gap-1.5">
						<span>{teamBName}</span>
						{rubber.winner_side === "b" && (
							<CheckIcon className="size-3 text-win shrink-0" />
						)}
					</div>
					<div
						className={cn(
							"text-xs md:text-sm truncate mt-0.5",
							rubber.winner_side === "b" && "text-win font-semibold",
						)}
					>
						{formatPlayerNames(rubber.players_b)}
					</div>
				</div>
			</div>

			{isFinished && rubber.end_reason === "retired" && rubber.winner_side && (
				<p className="mt-2 text-center text-xs text-muted-foreground">
					{rubber.winner_side === "a" ? teamAName : teamBName} thắng do đối
					phương bỏ cuộc. Tỉ số ván là số ván đã hoàn tất.
				</p>
			)}

			{/* Ghi chú khi skipped */}
			{isSkipped && !playAllRubbers && (
				<div className="mt-2 text-[11px] text-muted-foreground text-center italic">
					(Tie đã phân định thắng thua sớm theo thể thức)
				</div>
			)}
		</Card>
	);
}
