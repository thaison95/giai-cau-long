import * as React from "react";
import { cn } from "@/lib/utils";

export function ScoreValue({
	value,
	className,
}: {
	value: number;
	className?: string;
}) {
	const previous = React.useRef(value);
	const [flashing, setFlashing] = React.useState(false);
	React.useEffect(() => {
		if (previous.current === value) return;
		previous.current = value;
		setFlashing(true);
		const timer = window.setTimeout(() => setFlashing(false), 600);
		return () => window.clearTimeout(timer);
	}, [value]);
	return (
		<span
			className={cn(
				"transition-colors duration-300 motion-reduce:transition-none",
				flashing && "bg-primary/20 motion-reduce:bg-transparent",
				className,
			)}
		>
			{value}
		</span>
	);
}
