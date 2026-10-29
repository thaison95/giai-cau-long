import { CheckIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type Game = Database["public"]["Tables"]["games"]["Row"];
type Side = Database["public"]["Enums"]["side"];

interface ScoreBoardProps extends React.ComponentProps<"div"> {
	scoreA: number;
	scoreB: number;
	teamAName?: string;
	teamBName?: string;
	winnerSide?: Side | null;
	status?: "scheduled" | "live" | "finished" | "skipped";
	games?: Game[];
	size?: "sm" | "default" | "lg" | "display";
	labelA?: string;
	labelB?: string;
	showLabels?: boolean;
}

export function ScoreBoard({
	scoreA,
	scoreB,
	teamAName,
	teamBName,
	winnerSide,
	status,
	games,
	size = "default",
	labelA = "Đội A",
	labelB = "Đội B",
	showLabels = true,
	className,
	...props
}: ScoreBoardProps) {
	const scoreTextClasses = {
		sm: "text-lg md:text-xl",
		default: "text-2xl md:text-3xl",
		lg: "text-3xl md:text-5xl",
		display: "text-6xl md:text-7xl",
	}[size];

	const finishedGames = React.useMemo(() => {
		if (!games || games.length === 0) return [];
		return [...games].sort((g1, g2) => g1.game_no - g2.game_no);
	}, [games]);

	return (
		<div
			className={cn("flex flex-col items-center justify-center", className)}
			{...props}
		>
			<div className="flex items-center justify-center gap-3 md:gap-5 w-full">
				{/* Side A */}
				<div className="flex flex-1 flex-col items-end min-w-0">
					{showLabels && (
						<div className="flex items-center gap-1.5 mb-1 max-w-full">
							{winnerSide === "a" && (
								<Badge
									variant="win"
									className="h-4 px-1 text-[10px] gap-0.5 shrink-0"
								>
									<CheckIcon className="size-2.5" />
									<span>Thắng</span>
								</Badge>
							)}
							<span
								className={cn(
									"text-xs md:text-sm font-semibold truncate",
									winnerSide === "a" ? "text-win font-bold" : "text-team-a",
								)}
								title={teamAName || labelA}
							>
								{teamAName || labelA}
							</span>
						</div>
					)}
					<div
						className={cn(
							"font-heading font-bold tabular-nums transition-colors",
							scoreTextClasses,
							winnerSide === "a" ? "text-win" : "text-team-a",
						)}
					>
						{scoreA}
					</div>
				</div>

				{/* Divider */}
				<div className="text-muted-foreground/40 font-heading text-lg md:text-2xl select-none px-1">
					:
				</div>

				{/* Side B */}
				<div className="flex flex-1 flex-col items-start min-w-0">
					{showLabels && (
						<div className="flex items-center gap-1.5 mb-1 max-w-full">
							<span
								className={cn(
									"text-xs md:text-sm font-semibold truncate",
									winnerSide === "b" ? "text-win font-bold" : "text-team-b",
								)}
								title={teamBName || labelB}
							>
								{teamBName || labelB}
							</span>
							{winnerSide === "b" && (
								<Badge
									variant="win"
									className="h-4 px-1 text-[10px] gap-0.5 shrink-0"
								>
									<CheckIcon className="size-2.5" />
									<span>Thắng</span>
								</Badge>
							)}
						</div>
					)}
					<div
						className={cn(
							"font-heading font-bold tabular-nums transition-colors",
							scoreTextClasses,
							winnerSide === "b" ? "text-win" : "text-team-b",
						)}
					>
						{scoreB}
					</div>
				</div>
			</div>

			{/* Hiển thị chuỗi điểm các ván đã đấu nếu có */}
			{finishedGames.length > 0 && (
				<div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground">
					{finishedGames.map((g) => (
						<span
							key={g.id}
							className={cn(
								"inline-flex items-center px-1.5 py-0.5 bg-muted/60 border border-border/50",
								g.winner_side === "a" && "text-team-a",
								g.winner_side === "b" && "text-team-b",
							)}
						>
							V{g.game_no}: {g.score_a}–{g.score_b}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
