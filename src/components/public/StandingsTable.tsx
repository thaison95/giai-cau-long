import * as React from "react";
import { TeamName } from "@/components/public/TeamName";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type GroupStanding = Database["public"]["Views"]["group_standings"]["Row"];

interface StandingsTableProps {
	standings: GroupStanding[];
	teams: Team[];
	pointsMode?: string;
	className?: string;
}

export function StandingsTable({
	standings,
	teams,
	pointsMode = "tie_wins",
	className,
}: StandingsTableProps) {
	const teamMap = React.useMemo(() => {
		const map = new Map<string, Team>();
		for (const t of teams) {
			map.set(t.id, t);
		}
		return map;
	}, [teams]);

	// Sắp xếp thứ hạng theo tiêu chí: Điểm -> Hiệu số rubber -> Hiệu số game -> Hiệu số điểm
	const sortedRows = React.useMemo(() => {
		return [...standings].sort((a, b) => {
			const ptsA = a.points ?? 0;
			const ptsB = b.points ?? 0;
			if (ptsA !== ptsB) return ptsB - ptsA;

			const rubDiffA = (a.rubbers_for ?? 0) - (a.rubbers_against ?? 0);
			const rubDiffB = (b.rubbers_for ?? 0) - (b.rubbers_against ?? 0);
			if (rubDiffA !== rubDiffB) return rubDiffB - rubDiffA;

			const gmDiffA = a.games_diff ?? 0;
			const gmDiffB = b.games_diff ?? 0;
			if (gmDiffA !== gmDiffB) return gmDiffB - gmDiffA;

			const ptDiffA = a.points_diff ?? 0;
			const ptDiffB = b.points_diff ?? 0;
			return ptDiffB - ptDiffA;
		});
	}, [standings]);

	const isRubbersWon = pointsMode === "rubbers_won";

	const formatDiff = (diff?: number | null) => {
		if (diff == null) return "0";
		if (diff > 0) return `+${diff}`;
		return `${diff}`;
	};

	return (
		<div className={cn("space-y-2", className)}>
			<div className="border border-border/80 bg-card overflow-x-auto">
				<Table>
					<TableHeader className="bg-muted/40 font-heading">
						<TableRow>
							<TableHead className="w-12 text-center font-bold">#</TableHead>
							<TableHead className="min-w-[160px] font-bold">Đội</TableHead>
							<TableHead className="w-12 text-center font-bold">Trận</TableHead>
							<TableHead className="w-12 text-center font-bold text-win">
								T
							</TableHead>
							<TableHead className="w-12 text-center font-bold text-destructive">
								B
							</TableHead>
							<TableHead className="w-16 text-center font-bold bg-primary/10 text-primary">
								{isRubbersWon ? "Điểm (Trận)" : "Điểm (Tie)"}
							</TableHead>
							<TableHead className="w-20 text-center font-medium">
								HS Trận
							</TableHead>
							<TableHead className="w-20 text-center font-medium">
								HS Ván
							</TableHead>
							<TableHead className="w-20 text-center font-medium">
								HS Điểm
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedRows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-center py-6 text-muted-foreground italic text-xs"
								>
									Chưa có dữ liệu bảng xếp hạng
								</TableCell>
							</TableRow>
						) : (
							sortedRows.map((row, idx) => {
								const team = row.team_id ? teamMap.get(row.team_id) : null;
								const rank = idx + 1;
								const isTop2 = rank <= 2;

								return (
									<TableRow
										key={row.team_id || idx}
										className={cn(
											"font-mono text-xs hover:bg-muted/30 transition-colors",
											rank === 1 && "bg-amber-500/[0.04]",
										)}
									>
										<TableCell className="text-center font-heading font-bold">
											<span
												className={cn(
													"inline-flex items-center justify-center size-5 text-[11px]",
													isTop2 && "bg-foreground/5 font-extrabold",
													rank === 1 &&
														"text-amber-600 dark:text-amber-400 font-black",
												)}
											>
												{rank}
											</span>
										</TableCell>
										<TableCell className="font-sans">
											<TeamName team={team} showSeed={false} />
										</TableCell>
										<TableCell className="text-center tabular-nums">
											{row.played ?? 0}
										</TableCell>
										<TableCell className="text-center tabular-nums font-semibold text-win">
											{row.won ?? 0}
										</TableCell>
										<TableCell className="text-center tabular-nums text-muted-foreground">
											{row.lost ?? 0}
										</TableCell>
										<TableCell className="text-center tabular-nums font-heading font-bold text-sm bg-primary/5 text-primary">
											{row.points ?? 0}
										</TableCell>
										<TableCell className="text-center tabular-nums text-muted-foreground">
											{(row.rubbers_for ?? 0) - (row.rubbers_against ?? 0) > 0
												? `+${(row.rubbers_for ?? 0) - (row.rubbers_against ?? 0)}`
												: `${(row.rubbers_for ?? 0) - (row.rubbers_against ?? 0)}`}
											<span className="text-[10px] text-muted-foreground/60 ml-1">
												({row.rubbers_for ?? 0}-{row.rubbers_against ?? 0})
											</span>
										</TableCell>
										<TableCell className="text-center tabular-nums text-muted-foreground">
											{formatDiff(row.games_diff)}
										</TableCell>
										<TableCell className="text-center tabular-nums text-muted-foreground">
											{formatDiff(row.points_diff)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Footnote / Chú thích cách tính điểm */}
			<div className="flex flex-col gap-1 text-[11px] text-muted-foreground px-1">
				<p>
					<span className="font-semibold text-foreground">
						Cách tính điểm:{" "}
					</span>
					{isRubbersWon ? (
						<span>
							Mỗi trận nhỏ (rubber) thắng được tính{" "}
							<strong className="text-primary font-medium">1 điểm</strong> vào
							bảng điểm tổng (tối đa 3 điểm/tie).
						</span>
					) : (
						<span>
							Mỗi trận tie thắng được tính điểm quy định cho toàn đội.
						</span>
					)}
				</p>
				<p className="text-[10px] text-muted-foreground/80">
					* Tiêu chí xếp hạng: Điểm &gt; Hiệu số trận nhỏ (rubbers) &gt; Hiệu số
					ván &gt; Hiệu số điểm tổng.
				</p>
			</div>
		</div>
	);
}
