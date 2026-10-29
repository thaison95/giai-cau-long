import { createFileRoute, Link } from "@tanstack/react-router";
import {
	CalendarDaysIcon,
	ChevronRightIcon,
	FlameIcon,
	MapPinIcon,
	TrophyIcon,
	UsersIcon,
} from "lucide-react";
import * as React from "react";
import { LiveBadge } from "@/components/public/LiveBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type PublicTournamentItem,
	usePublicTournaments,
} from "@/hooks/use-public-queries";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const {
		data: tournaments,
		isLoading,
		error,
		refetch,
	} = usePublicTournaments();

	return (
		<main className="mx-auto min-h-[75vh] max-w-5xl px-4 py-8 md:px-6 md:py-12">
			{/* Hero / Header Section */}
			<div className="mb-8 border-b border-border/80 pb-6">
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
					<FlameIcon className="size-4" />
					<span>Hệ thống quản lý giải cầu lông đồng đội</span>
				</div>
				<h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
					Các giải đấu
				</h1>
				<p className="mt-2 text-sm text-muted-foreground max-w-2xl">
					Theo dõi trực tiếp kết quả, bảng xếp hạng và lịch thi đấu theo thể
					thức đồng đội (Thomas Cup / Vòng bảng &amp; Phân hạng).
				</p>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="grid gap-4 sm:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i} className="p-5 space-y-4 border">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-5 w-16" />
							</div>
							<Skeleton className="h-7 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<div className="flex gap-4 pt-2 border-t border-border/40">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-4 w-28" />
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Error State */}
			{error && !isLoading && (
				<div className="rounded-none border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">
					<p className="font-semibold text-destructive mb-2">
						Không thể tải danh sách giải đấu
					</p>
					<p className="text-muted-foreground text-xs mb-4">
						Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="text-xs"
					>
						Thử lại
					</Button>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && (!tournaments || tournaments.length === 0) && (
				<Empty className="py-16 border bg-muted/10">
					<EmptyMedia variant="icon">
						<TrophyIcon className="size-6 text-muted-foreground" />
					</EmptyMedia>
					<EmptyHeader>
						<EmptyTitle>Chưa có giải đấu công khai</EmptyTitle>
						<EmptyDescription>
							Hiện chưa có giải đấu nào được công bố. Các giải đấu đang hoặc sắp
							diễn ra sẽ xuất hiện tại đây khi ban tổ chức công khai.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							render={<Link to="/admin" />}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							Khu vực Ban tổ chức
						</Button>
					</EmptyContent>
				</Empty>
			)}

			{/* Tournament Cards Grid */}
			{!isLoading && !error && tournaments && tournaments.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2">
					{tournaments.map((t) => (
						<TournamentCard key={t.id} tournament={t} />
					))}
				</div>
			)}
		</main>
	);
}

function TournamentCard({ tournament }: { tournament: PublicTournamentItem }) {
	const isLive = tournament.has_live_tie;
	const isFinished = tournament.status === "finished";

	const dateText = React.useMemo(() => {
		if (tournament.start_date && tournament.end_date) {
			if (tournament.start_date === tournament.end_date) {
				return formatDate(tournament.start_date);
			}
			return `${formatDate(tournament.start_date)} – ${formatDate(tournament.end_date)}`;
		}
		if (tournament.start_date) {
			return `Từ ${formatDate(tournament.start_date)}`;
		}
		return null;
	}, [tournament.start_date, tournament.end_date]);

	return (
		<Link
			to="/t/$slug"
			params={{ slug: tournament.slug }}
			className="block group no-underline text-foreground"
		>
			<Card
				className={`relative p-5 border transition-all group-hover:border-primary group-hover:shadow-md flex flex-col justify-between h-full ${
					isLive
						? "ring-1 ring-live/60 border-live/40 bg-live/[0.02]"
						: "bg-card border-border"
				}`}
			>
				<div>
					{/* Top Header: Badge Status */}
					<div className="flex items-center justify-between gap-2 mb-3">
						<div className="flex items-center gap-1.5 flex-wrap">
							{isLive && <LiveBadge />}
							{!isLive && isFinished && (
								<Badge
									variant="outline"
									className="text-muted-foreground text-[11px]"
								>
									Đã kết thúc
								</Badge>
							)}
							{!isLive && !isFinished && (
								<Badge variant="secondary" className="font-medium text-[11px]">
									Đang diễn ra / Sắp tới
								</Badge>
							)}
							{tournament.play_all_rubbers && (
								<Badge
									variant="outline"
									className="text-[10px] border-primary/30 text-primary font-mono"
								>
									Đấu trọn vẹn
								</Badge>
							)}
						</div>

						<div className="text-muted-foreground group-hover:text-primary transition-colors">
							<ChevronRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
						</div>
					</div>

					{/* Title */}
					<h2 className="font-heading font-bold text-lg md:text-xl group-hover:text-primary transition-colors leading-snug line-clamp-2">
						{tournament.name}
					</h2>

					{/* Description if any */}
					{tournament.description && (
						<p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
							{tournament.description}
						</p>
					)}
				</div>

				{/* Metadata Footer */}
				<div className="mt-5 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-muted-foreground">
					<div className="flex items-center gap-3 flex-wrap">
						{dateText && (
							<span className="inline-flex items-center gap-1">
								<CalendarDaysIcon className="size-3.5 text-foreground/60 shrink-0" />
								<span>{dateText}</span>
							</span>
						)}

						{tournament.venue && (
							<span className="inline-flex items-center gap-1">
								<MapPinIcon className="size-3.5 text-foreground/60 shrink-0" />
								<span className="truncate max-w-[150px]">
									{tournament.venue}
								</span>
							</span>
						)}
					</div>

					<div className="flex items-center gap-1.5 text-foreground/80 font-medium font-mono text-[11px]">
						<UsersIcon className="size-3.5 text-primary shrink-0" />
						<span>{tournament.team_count ?? 0} đội</span>
					</div>
				</div>
			</Card>
		</Link>
	);
}
