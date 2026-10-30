import { Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	CalendarDaysIcon,
	CheckIcon,
	MapPinIcon,
} from "lucide-react";
import * as React from "react";
import { LiveBadge } from "@/components/public/LiveBadge";
import { TeamName } from "@/components/public/TeamName";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { cn, formatDateTime } from "@/lib/utils";

type Tie = Database["public"]["Tables"]["ties"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type Rubber = Database["public"]["Tables"]["rubbers"]["Row"];

interface TieCardProps {
	slug: string;
	tie: Tie;
	teamA?: Team | null;
	teamB?: Team | null;
	rubbers?: Rubber[];
	className?: string;
}

export function TieCard({
	slug,
	tie,
	teamA,
	teamB,
	rubbers = [],
	className,
}: TieCardProps) {
	const isLive = tie.status === "live";
	const isFinished = tie.status === "finished";

	const tieRubbers = React.useMemo(() => {
		return rubbers
			.filter((r) => r.tie_id === tie.id)
			.sort((a, b) => a.position - b.position);
	}, [rubbers, tie.id]);

	const winnerA = tie.winner_team_id && tie.winner_team_id === tie.team_a_id;
	const winnerB = tie.winner_team_id && tie.winner_team_id === tie.team_b_id;

	return (
		<Link
			to="/t/$slug/ties/$tieId"
			params={{ slug, tieId: tie.id }}
			className="block group no-underline text-foreground"
		>
			<Card
				className={cn(
					"border p-4 transition-all group-hover:border-primary/50 group-hover:shadow-sm",
					isLive && "ring-1 ring-live/60 border-live/40 bg-live/[0.02]",
					isFinished && "bg-card",
					className,
				)}
			>
				{/* Top bar: Round label, Court, Scheduled Time, Status */}
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 mb-3 text-xs">
					<div className="flex items-center gap-2">
						<span className="font-heading font-semibold text-foreground">
							{tie.round_label}
						</span>
						{tie.stage === "knockout" && (
							<Badge
								variant="outline"
								className="text-[10px] uppercase font-mono"
							>
								Phân hạng
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-3">
						{tie.court && (
							<span className="inline-flex items-center gap-1 text-muted-foreground font-medium text-xs">
								<MapPinIcon className="size-3 text-primary/70 shrink-0" />
								{tie.court}
							</span>
						)}

						{tie.scheduled_at && !isLive && (
							<span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-mono">
								<CalendarDaysIcon className="size-3 shrink-0" />
								{formatDateTime(tie.scheduled_at)}
							</span>
						)}

						{isLive && <LiveBadge />}
						{isFinished && (
							<Badge variant="win" className="gap-1 font-semibold text-[11px]">
								<CheckIcon className="size-3" />
								Đã xong
							</Badge>
						)}
						{tie.status === "scheduled" && (
							<Badge
								variant="outline"
								className="text-muted-foreground text-[11px]"
							>
								Sắp diễn ra
							</Badge>
						)}
					</div>
				</div>

				{/* Main Tie Matchup Row */}
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 py-1">
					{/* Team A */}
					<div className="flex flex-col min-w-0 items-start">
						<TeamName
							team={teamA}
							side="a"
							className={cn(winnerA && "font-bold text-win")}
						/>
					</div>

					{/* Center Score */}
					<div className="flex items-center justify-center px-3 py-1.5 bg-muted/40 border border-border/40 min-w-[70px] md:min-w-[90px]">
						<div className="font-heading font-bold text-xl md:text-2xl tabular-nums flex items-center gap-1.5">
							<span className={cn(winnerA ? "text-win" : "text-team-a")}>
								{tie.rubbers_won_a}
							</span>
							<span className="text-muted-foreground/40 font-normal">:</span>
							<span className={cn(winnerB ? "text-win" : "text-team-b")}>
								{tie.rubbers_won_b}
							</span>
						</div>
					</div>

					{/* Team B */}
					<div className="flex flex-col min-w-0 items-end">
						<TeamName
							team={teamB}
							side="b"
							className={cn(winnerB && "font-bold text-win")}
						/>
					</div>
				</div>

				{/* Rubbers Mini Summary List if available */}
				{tieRubbers.length > 0 && (
					<div className="mt-3 pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
						<div className="flex flex-wrap items-center gap-1.5 text-[11px]">
							{tieRubbers.map((r) => {
								const isMix = r.kind === "mixed_doubles";
								return (
									<span
										key={r.id}
										className={cn(
											"inline-flex items-center gap-1 px-1.5 py-0.5 border font-mono text-[10px]",
											isMix
												? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
												: "border-border/60 bg-muted/30 text-muted-foreground",
											r.status === "live" &&
												"border-live/60 bg-live/10 text-live font-bold animate-pulse",
											r.status === "skipped" && "opacity-40 line-through",
										)}
									>
										T{r.position}
										{r.status === "finished" && (
											<span className="font-bold">
												({r.games_won_a}–{r.games_won_b})
												{r.end_reason === "retired" && r.winner_side && (
													<span className="ml-1 font-sans font-normal">
														{r.winner_side === "a" ? "A" : "B"} thắng do bỏ cuộc
													</span>
												)}
											</span>
										)}
									</span>
								);
							})}
						</div>

						<div className="inline-flex items-center gap-1 text-xs text-primary group-hover:translate-x-0.5 transition-transform font-medium">
							<span>Chi tiết</span>
							<ArrowRightIcon className="size-3.5" />
						</div>
					</div>
				)}
			</Card>
		</Link>
	);
}
