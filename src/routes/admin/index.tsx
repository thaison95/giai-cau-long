import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	CalendarIcon,
	MapPinIcon,
	PlusIcon,
	TrophyIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

export const Route = createFileRoute("/admin/")({
	component: AdminTournamentsPage,
});

function AdminTournamentsPage() {
	const { user } = useAuth();

	const {
		data: tournaments,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["admin", "tournaments", user?.id],
		queryFn: async () => {
			if (!user) return [];

			// Lấy danh sách ID các giải mà user hiện tại là organizer
			const { data: orgData, error: orgError } = await supabase
				.from("tournament_organizers")
				.select("tournament_id")
				.eq("user_id", user.id);

			if (orgError) throw orgError;
			if (!orgData || orgData.length === 0) return [];

			const tournamentIds = orgData.map((item) => item.tournament_id);

			const { data, error } = await supabase
				.from("tournaments")
				.select("*")
				.in("id", tournamentIds)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data as Tournament[];
		},
		enabled: !!user,
	});

	return (
		<main className="mx-auto min-h-[75vh] max-w-5xl px-4 py-8 md:px-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div>
					<h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
						Giải đấu của bạn
					</h1>
					<p className="text-xs md:text-sm text-muted-foreground mt-1">
						Quản lý thông tin, danh sách đội, bảng đấu và lịch thi đấu các giải
						bạn phụ trách.
					</p>
				</div>
				<Button
					render={<Link to="/admin/tournaments/new" />}
					className="gap-1.5 self-start sm:self-auto"
				>
					<PlusIcon className="size-4" />
					<span>Tạo giải mới</span>
				</Button>
			</div>

			<div className="mt-6">
				{isLoading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="p-4 space-y-3">
								<div className="flex justify-between items-start">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-5 w-16" />
								</div>
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-8 w-full mt-2" />
							</Card>
						))}
					</div>
				) : error ? (
					<div className="rounded-none border border-destructive/20 bg-destructive/5 p-6 text-center text-xs text-destructive">
						Đã xảy ra lỗi khi tải danh sách giải đấu. Vui lòng tải lại trang.
					</div>
				) : !tournaments || tournaments.length === 0 ? (
					<Empty className="border border-dashed py-14">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<TrophyIcon className="size-6 text-muted-foreground" />
							</EmptyMedia>
							<EmptyTitle>Chưa có giải đấu nào</EmptyTitle>
							<EmptyDescription>
								Bạn chưa quản lý giải đấu nào. Hãy tạo giải đấu đầu tiên để bắt
								đầu thêm đội, phân bảng và xếp lịch thi đấu.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								render={<Link to="/admin/tournaments/new" />}
								className="gap-1.5"
							>
								<PlusIcon className="size-4" />
								Tạo giải đấu đầu tiên
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{tournaments.map((t) => (
							<Card
								key={t.id}
								className="flex flex-col justify-between hover:border-foreground/30 transition-colors"
							>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between gap-2">
										<CardTitle
											className="line-clamp-1 text-sm font-semibold"
											title={t.name}
										>
											{t.name}
										</CardTitle>
										<StatusBadge status={t.status} />
									</div>
									<CardDescription className="font-mono text-[11px] text-muted-foreground">
										/t/{t.slug}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-2.5 pb-4 text-xs text-muted-foreground flex-1">
									{t.venue && (
										<div className="flex items-center gap-1.5">
											<MapPinIcon className="size-3.5 shrink-0" />
											<span className="line-clamp-1">{t.venue}</span>
										</div>
									)}

									{(t.start_date || t.end_date) && (
										<div className="flex items-center gap-1.5">
											<CalendarIcon className="size-3.5 shrink-0" />
											<span>
												{formatDate(t.start_date)}
												{t.start_date && t.end_date && " – "}
												{formatDate(t.end_date)}
											</span>
										</div>
									)}

									{t.description && (
										<p className="line-clamp-2 text-[11px] text-muted-foreground/80 pt-1">
											{t.description}
										</p>
									)}
								</CardContent>

								<div className="border-t border-border p-3 pt-2">
									<Button
										variant="outline"
										size="sm"
										className="w-full justify-between text-xs"
										render={
											<Link to="/admin/tournaments/$id" params={{ id: t.id }} />
										}
									>
										<span>Quản lý giải đấu</span>
										<ArrowRightIcon className="size-3.5" />
									</Button>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>
		</main>
	);
}

function StatusBadge({ status }: { status: Tournament["status"] }) {
	switch (status) {
		case "draft":
			return <Badge variant="secondary">Bản nháp</Badge>;
		case "published":
			return <Badge variant="default">Đang công khai</Badge>;
		case "finished":
			return <Badge variant="outline">Đã kết thúc</Badge>;
		default:
			return null;
	}
}
