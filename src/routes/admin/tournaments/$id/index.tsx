import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	CalendarDaysIcon,
	CalendarIcon,
	CheckCircle2Icon,
	ClockIcon,
	GridIcon,
	InfoIcon,
	MapPinIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { useTournamentAdmin } from "../$id";

export const Route = createFileRoute("/admin/tournaments/$id/")({
	component: TournamentOverviewPage,
});

function TournamentOverviewPage() {
	const { tournament } = useTournamentAdmin();

	// Lấy các số liệu thống kê cơ bản
	const { data: stats } = useQuery({
		queryKey: ["admin", "tournament-stats", tournament.id],
		queryFn: async () => {
			const [
				{ count: teamsCount },
				{ count: playersCount },
				{ count: groupsCount },
				{ count: tiesCount },
				{ count: rubbersCount },
				{ count: refereesCount },
			] = await Promise.all([
				supabase
					.from("teams")
					.select("*", { count: "exact", head: true })
					.eq("tournament_id", tournament.id),
				supabase
					.from("players")
					.select("*", { count: "exact", head: true })
					.eq("tournament_id", tournament.id),
				supabase
					.from("tournament_groups")
					.select("*", { count: "exact", head: true })
					.eq("tournament_id", tournament.id),
				supabase
					.from("ties")
					.select("*", { count: "exact", head: true })
					.eq("tournament_id", tournament.id),
				supabase
					.from("rubbers")
					.select("*", { count: "exact", head: true })
					.eq("tournament_id", tournament.id),
				supabase
					.from("referees")
					.select("*", { count: "exact", head: true })
					.eq("tournament_id", tournament.id),
			]);

			return {
				teams: teamsCount ?? 0,
				players: playersCount ?? 0,
				groups: groupsCount ?? 0,
				ties: tiesCount ?? 0,
				rubbers: rubbersCount ?? 0,
				referees: refereesCount ?? 0,
			};
		},
	});

	return (
		<div className="space-y-6">
			{/* Thông báo trạng thái giải */}
			{tournament.status === "draft" && (
				<Alert className="border-secondary bg-secondary/20">
					<InfoIcon className="size-4" />
					<AlertTitle className="text-xs font-semibold">
						Giải đang ở chế độ bản nháp
					</AlertTitle>
					<AlertDescription className="text-xs text-muted-foreground mt-0.5">
						Khán giả chưa thể nhìn thấy giải đấu này. Hãy thiết lập danh sách
						đội, bảng đấu và lịch thi đấu trước khi công khai giải trong phần
						Cài đặt.
					</AlertDescription>
				</Alert>
			)}

			{tournament.status === "published" && (
				<Alert className="border-primary/30 bg-primary/5">
					<CheckCircle2Icon className="size-4 text-primary" />
					<AlertTitle className="text-xs font-semibold text-primary">
						Giải đang công khai
					</AlertTitle>
					<AlertDescription className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
						<span>Khán giả có thể xem thông tin và tỉ số trực tiếp tại:</span>
						<a
							href={`/t/${tournament.slug}`}
							target="_blank"
							rel="noreferrer"
							className="font-mono text-xs text-primary underline underline-offset-2"
						>
							/t/{tournament.slug}
						</a>
					</AlertDescription>
				</Alert>
			)}

			{tournament.status === "finished" && (
				<Alert className="border-muted bg-muted/40">
					<ClockIcon className="size-4 text-muted-foreground" />
					<AlertTitle className="text-xs font-semibold">
						Giải đấu đã kết thúc
					</AlertTitle>
					<AlertDescription className="text-xs text-muted-foreground mt-0.5">
						Toàn bộ các trận đấu đã hoàn thành. Danh sách trọng tài và các đường
						dẫn chấm điểm bí mật đã được thu hồi.
					</AlertDescription>
				</Alert>
			)}

			{/* Thống kê số lượng */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
				<Card className="p-3 text-center">
					<div className="text-xl font-bold font-mono text-foreground">
						{stats?.teams ?? "–"}
					</div>
					<div className="text-[11px] text-muted-foreground mt-0.5">
						Đội thi đấu
					</div>
				</Card>
				<Card className="p-3 text-center">
					<div className="text-xl font-bold font-mono text-foreground">
						{stats?.players ?? "–"}
					</div>
					<div className="text-[11px] text-muted-foreground mt-0.5">
						Vận động viên
					</div>
				</Card>
				<Card className="p-3 text-center">
					<div className="text-xl font-bold font-mono text-foreground">
						{stats?.groups ?? "–"}
					</div>
					<div className="text-[11px] text-muted-foreground mt-0.5">
						Bảng đấu
					</div>
				</Card>
				<Card className="p-3 text-center">
					<div className="text-xl font-bold font-mono text-foreground">
						{stats?.ties ?? "–"}
					</div>
					<div className="text-[11px] text-muted-foreground mt-0.5">
						Trận đồng đội
					</div>
				</Card>
				<Card className="p-3 text-center">
					<div className="text-xl font-bold font-mono text-foreground">
						{stats?.rubbers ?? "–"}
					</div>
					<div className="text-[11px] text-muted-foreground mt-0.5">
						Trận đơn/đôi
					</div>
				</Card>
				<Card className="p-3 text-center">
					<div className="text-xl font-bold font-mono text-foreground">
						{stats?.referees ?? "–"}
					</div>
					<div className="text-[11px] text-muted-foreground mt-0.5">
						Trọng tài
					</div>
				</Card>
			</div>

			{/* Thông tin giải & luật thi đấu */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-semibold">
							Thông tin giải đấu
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2.5 text-xs text-muted-foreground">
						{tournament.venue && (
							<div className="flex items-start gap-2">
								<MapPinIcon className="size-3.5 shrink-0 mt-0.5 text-foreground" />
								<span>{tournament.venue}</span>
							</div>
						)}
						{(tournament.start_date || tournament.end_date) && (
							<div className="flex items-center gap-2">
								<CalendarIcon className="size-3.5 shrink-0 text-foreground" />
								<span>
									{formatDate(tournament.start_date)}
									{tournament.start_date && tournament.end_date && " – "}
									{formatDate(tournament.end_date)}
								</span>
							</div>
						)}
						{tournament.description && (
							<p className="text-[11px] text-muted-foreground/90 border-t border-border pt-2">
								{tournament.description}
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-semibold">
							Luật thi đấu & Cấu trúc rubber
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-xs">
						<div className="flex justify-between py-1 border-b border-border">
							<span className="text-muted-foreground">Điểm thắng ván:</span>
							<span className="font-mono font-medium">
								{tournament.rule_points_to_win} điểm (chạm trần{" "}
								{tournament.rule_points_cap})
							</span>
						</div>
						<div className="flex justify-between py-1 border-b border-border">
							<span className="text-muted-foreground">Thắng rubber:</span>
							<span className="font-mono font-medium">
								Thắng {tournament.rule_games_to_win} ván
							</span>
						</div>
						<div className="flex justify-between py-1 border-b border-border">
							<span className="text-muted-foreground">
								Thắng trận đồng đội (tie):
							</span>
							<span className="font-mono font-medium">
								Thắng {tournament.rule_rubbers_to_win_tie} rubber
							</span>
						</div>
						<div className="flex justify-between py-1">
							<span className="text-muted-foreground">Mẫu 5 rubber:</span>
							<span className="font-mono font-medium">
								{tournament.rubber_template
									.map((r) => (r === "singles" ? "Đơn" : "Đôi"))
									.join(" – ")}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Lối tắt các bước chuẩn bị giải */}
			<div>
				<h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
					Các bước chuẩn bị giải đấu
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Link
						to="/admin/tournaments/$id/teams"
						params={{ id: tournament.id }}
						className="group block p-4 border border-border hover:border-foreground/30 transition-colors bg-card"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 bg-muted text-foreground">
									<UsersIcon className="size-4" />
								</div>
								<div>
									<h4 className="font-heading text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
										1. Đội thi đấu & Vận động viên
									</h4>
									<p className="text-[11px] text-muted-foreground">
										Thêm các đội tham gia và danh sách VĐV của từng đội.
									</p>
								</div>
							</div>
							<ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
						</div>
					</Link>

					<Link
						to="/admin/tournaments/$id/groups"
						params={{ id: tournament.id }}
						className="group block p-4 border border-border hover:border-foreground/30 transition-colors bg-card"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 bg-muted text-foreground">
									<GridIcon className="size-4" />
								</div>
								<div>
									<h4 className="font-heading text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
										2. Chia bảng đấu
									</h4>
									<p className="text-[11px] text-muted-foreground">
										Tạo bảng A, B... và phân bổ các đội vào bảng tương ứng.
									</p>
								</div>
							</div>
							<ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
						</div>
					</Link>

					<Link
						to="/admin/tournaments/$id/ties"
						params={{ id: tournament.id }}
						className="group block p-4 border border-border hover:border-foreground/30 transition-colors bg-card"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 bg-muted text-foreground">
									<CalendarDaysIcon className="size-4" />
								</div>
								<div>
									<h4 className="font-heading text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
										3. Lập lịch thi đấu
									</h4>
									<p className="text-[11px] text-muted-foreground">
										Tạo trận đấu hoặc tự động sinh vòng tròn cho từng bảng.
									</p>
								</div>
							</div>
							<ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
						</div>
					</Link>

					<Link
						to="/admin/tournaments/$id/referees"
						params={{ id: tournament.id }}
						className="group block p-4 border border-border hover:border-foreground/30 transition-colors bg-card"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="p-2 bg-muted text-foreground">
									<ShieldCheckIcon className="size-4" />
								</div>
								<div>
									<h4 className="font-heading text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
										4. Danh sách trọng tài
									</h4>
									<p className="text-[11px] text-muted-foreground">
										Thêm trọng tài và gửi đường dẫn bí mật để chấm điểm.
									</p>
								</div>
							</div>
							<ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
