import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/r/$token/")({ component: RefereeHome });

function RefereeHome() {
	const { token } = Route.useParams();
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["referee-home"],
		queryFn: async () => {
			// The secret is sent only to the validation RPC; it is never logged or queried elsewhere.
			const { data: who, error: whoError } = await supabase.rpc(
				"referee_whoami",
				{ p_token: token },
			);
			if (whoError) {
				if (whoError.message.includes("invalid_token")) return null;
				throw whoError;
			}
			if (!who?.[0]) return null;
			const referee = who[0];
			const { data: rubbers, error: rubberError } = await supabase
				.from("rubbers")
				.select("*")
				.eq("referee_id", referee.referee_id)
				.eq("tournament_id", referee.tournament_id);
			if (rubberError) throw rubberError;
			const tieIds = [
				...new Set((rubbers ?? []).map((rubber) => rubber.tie_id)),
			];
			const [tiesRes, teamsRes] = await Promise.all([
				supabase
					.from("ties")
					.select("id,round_label,team_a_id,team_b_id")
					.in("id", tieIds),
				supabase
					.from("teams")
					.select("id,name")
					.eq("tournament_id", referee.tournament_id),
			]);
			if (tiesRes.error) throw tiesRes.error;
			if (teamsRes.error) throw teamsRes.error;
			return {
				referee,
				rubbers: rubbers ?? [],
				ties: tiesRes.data ?? [],
				teams: teamsRes.data ?? [],
			};
		},
		gcTime: 0,
		refetchOnMount: "always",
	});
	const sorted = [...(data?.rubbers ?? [])].sort((a, b) => {
		const liveOrder =
			(a.status === "live" ? 0 : 1) - (b.status === "live" ? 0 : 1);
		if (liveOrder) return liveOrder;
		const aTime = a.scheduled_at
			? Date.parse(a.scheduled_at)
			: Number.POSITIVE_INFINITY;
		const bTime = b.scheduled_at
			? Date.parse(b.scheduled_at)
			: Number.POSITIVE_INFINITY;
		return aTime - bTime || a.position - b.position;
	});
	const statusLabel = (status: string) =>
		status === "live"
			? "Đang thi đấu"
			: status === "finished"
				? "Đã kết thúc"
				: status === "skipped"
					? "Không thi đấu"
					: "Sắp diễn ra";
	const kindLabel = (kind: string) =>
		kind === "singles"
			? "Đơn"
			: kind === "mixed_doubles"
				? "Đôi nam nữ"
				: "Đôi";
	return (
		<main className="mx-auto min-h-[70vh] max-w-3xl space-y-5 px-4 py-8 md:px-6">
			{isLoading ? (
				<Card className="h-32 animate-pulse" />
			) : error ? (
				<Card className="p-6 text-center">
					<h1 className="font-heading text-xl font-bold">
						Không tải được danh sách trận
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Kiểm tra kết nối mạng rồi thử lại.
					</p>
					<Button className="mt-4" onClick={() => void refetch()}>
						Thử lại
					</Button>
				</Card>
			) : !data ? (
				<Card className="p-6 text-center">
					<h1 className="font-heading text-xl font-bold">
						Link không còn hiệu lực
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Hãy liên hệ ban tổ chức để nhận đường dẫn mới.
					</p>
				</Card>
			) : (
				<>
					<div>
						<h1 className="font-heading text-2xl font-bold">
							Xin chào, {data.referee.name}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Các trận được phân công của bạn.
						</p>
					</div>
					{sorted.length === 0 ? (
						<Card className="p-6 text-center text-sm text-muted-foreground">
							Chưa có trận nào được phân công.
						</Card>
					) : (
						<div className="space-y-3">
							{sorted.map((rubber) => {
								const tie = data.ties.find((item) => item.id === rubber.tie_id);
								const teamA =
									data.teams.find((team) => team.id === tie?.team_a_id)?.name ??
									"Chờ xác định";
								const teamB =
									data.teams.find((team) => team.id === tie?.team_b_id)?.name ??
									"Chờ xác định";
								return (
									<Card
										key={rubber.id}
										className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<b>
													{kindLabel(rubber.kind)} {rubber.position}
												</b>
												<Badge
													variant={
														rubber.status === "live"
															? "live"
															: rubber.status === "finished"
																? "win"
																: "outline"
													}
												>
													{statusLabel(rubber.status)}
												</Badge>
											</div>
											<p className="mt-1 text-sm">
												{teamA} – {teamB}
											</p>
											<p className="text-xs text-muted-foreground">
												{tie?.round_label ?? "Tie"}
												{rubber.court ? ` · ${rubber.court}` : ""}
											</p>
										</div>
										<Button
											render={
												<Link
													to="/r/$token/rubbers/$rubberId"
													params={{ token, rubberId: rubber.id }}
												/>
											}
											disabled={rubber.status === "skipped"}
										>
											{rubber.status === "live"
												? "Tiếp tục chấm"
												: rubber.status === "finished"
													? "Xem kết quả"
													: "Mở trận"}
										</Button>
									</Card>
								);
							})}
						</div>
					)}
				</>
			)}
		</main>
	);
}
