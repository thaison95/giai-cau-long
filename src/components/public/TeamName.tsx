import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface TeamNameProps extends React.ComponentProps<"div"> {
	team?: Pick<Team, "name" | "short_name" | "flag_emoji" | "seed"> | null;
	side?: "a" | "b";
	compact?: boolean;
	showSeed?: boolean;
	fallbackText?: string;
}

export function TeamName({
	team,
	side,
	compact = false,
	showSeed = true,
	fallbackText = "Chờ xác định đội",
	className,
	...props
}: TeamNameProps) {
	if (!team) {
		return (
			<div
				className={cn(
					"inline-flex items-center gap-1.5 text-muted-foreground italic text-xs md:text-sm",
					side === "a" && "border-l-3 border-team-a pl-2",
					side === "b" && "border-l-3 border-team-b pl-2",
					className,
				)}
				{...props}
			>
				<span>{fallbackText}</span>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 min-w-0 font-medium",
				side === "a" && "border-l-3 border-team-a pl-2",
				side === "b" && "border-l-3 border-team-b pl-2",
				className,
			)}
			{...props}
		>
			{team.flag_emoji && (
				<span
					className="shrink-0 text-base leading-none select-none"
					role="img"
					aria-label="flag"
				>
					{team.flag_emoji}
				</span>
			)}
			<span className="truncate font-heading">
				{compact ? team.short_name || team.name : team.name}
			</span>
			{!compact && team.short_name && team.short_name !== team.name && (
				<span className="text-[11px] text-muted-foreground uppercase shrink-0 font-mono">
					({team.short_name})
				</span>
			)}
			{showSeed && team.seed != null && (
				<Badge
					variant="outline"
					className="h-4 px-1 text-[10px] font-mono text-muted-foreground shrink-0 border-muted-foreground/30"
				>
					#{team.seed}
				</Badge>
			)}
		</div>
	);
}
