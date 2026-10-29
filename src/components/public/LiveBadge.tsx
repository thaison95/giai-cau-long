import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveBadgeProps extends React.ComponentProps<typeof Badge> {
	label?: string;
}

export function LiveBadge({
	className,
	label = "TRỰC TIẾP",
	children,
	...props
}: LiveBadgeProps) {
	return (
		<Badge
			variant="live"
			className={cn(
				"gap-1.5 font-semibold uppercase tracking-wider text-[11px]",
				className,
			)}
			{...props}
		>
			<span
				className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none shrink-0"
				aria-hidden="true"
			/>
			{children || label}
		</Badge>
	);
}
