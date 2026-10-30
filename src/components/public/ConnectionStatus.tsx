import { WifiOffIcon } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export function ConnectionStatus({ connected }: { connected: boolean }) {
	if (!connected)
		return (
			<Alert className="border-warning/40 bg-warning/10 text-warning">
				<WifiOffIcon aria-hidden="true" />
				<span>Mất kết nối – đang thử lại…</span>
			</Alert>
		);
	return (
		<div className="flex items-center gap-2 text-xs text-muted-foreground">
			<span aria-hidden="true" className="size-2 rounded-full bg-primary" />
			Đang cập nhật trực tiếp
		</div>
	);
}
