import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	CheckIcon,
	MapPinIcon,
	TrophyIcon,
} from "lucide-react";
import * as React from "react";
import { ConnectionStatus } from "@/components/public/ConnectionStatus";
import { LiveBadge } from "@/components/public/LiveBadge";
import { RubberCard } from "@/components/public/RubberCard";
import { TeamName } from "@/components/public/TeamName";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicTieDetails } from "@/hooks/use-public-queries";
import { useRealtime } from "@/hooks/use-realtime";
import { cn, formatDateTime } from "@/lib/utils";
import { useTournamentPublic } from "../../$slug";

export const Route = createFileRoute("/t/$slug/ties/$tieId")({
	component: TieDetailPage,
});

function TieDetailPage() {
	const { tournament } = useTournamentPublic();
	const { tieId } = Route.useParams();
	const connected = useRealtime({ kind: "tie", tieId });
	const { data: tie, isLoading } = usePublicTieDetails(tieId);

	// Ref để tự động cuộn (auto-scroll) tới rubber đang live khi mở trang lần đầu
	const liveRubberRef = React.useRef<HTMLDivElement | null>(null);
	const hasScrolledRef = React.useRef(false);

	const isTieLive = tie?.status === "live";
	const isTieFinished = tie?.status === "finished";

	const winnerA = tie?.winner_team_id && tie.winner_team_id === tie.team_a_id;
	const winnerB = tie?.winner_team_id && tie.winner_team_id === tie.team_b_id;

	const sortedRubbers = React.useMemo(() => {
		if (!tie?.rubbers) return [];
		return [...tie.rubbers].sort((a, b) => a.position - b.position);
	}, [tie?.rubbers]);

	React.useEffect(() => {
		if (!isLoading && tie && !hasScrolledRef.current) {
			if (liveRubberRef.current) {
				liveRubberRef.current.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				hasScrolledRef.current = true;
			}
		}
	}, [isLoading, tie]);

	if (isLoading) {
		return (
			<main className="mx-auto min-h-[80vh] max-w-4xl px-4 py-8 md:px-6">
				<Skeleton className="h-6 w-36 mb-6" />
				<Card className="p-6 mb-8 border">
					<Skeleton className="h-8 w-2/3 mx-auto mb-4" />
					<Skeleton className="h-16 w-1/3 mx-auto mb-4" />
					<Skeleton className="h-4 w-1/2 mx-auto" />
				</Card>
				<div className="space-y-4">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			</main>
		);
	}

	if (!tie) {
		return (
			<main className="mx-auto grid min-h-[70vh] max-w-4xl place-content-center px-4 text-center">
				<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none bg-muted text-muted-foreground">
					<TrophyIcon className="size-6" />
				</div>
				<h1 className="font-heading text-2xl font-bold">
					Không tìm thấy trận đấu
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Trận đấu này không tồn tại hoặc đã được thay đổi.
				</p>
				<div className="mt-6 flex justify-center">
					<Button
						render={<Link to="/t/$slug" params={{ slug: tournament.slug }} />}
						variant="outline"
						size="sm"
						className="gap-1.5 text-xs"
					>
						<ArrowLeftIcon className="size-3.5" />
						<span>Quay lại giải đấu</span>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto min-h-[80vh] max-w-4xl px-4 py-6 md:px-6 md:py-10">
			<ConnectionStatus connected={connected} />
			{/* Breadcrumb quay lại giải đấu */}
			<div className="mb-4">
				<Button
					render={<Link to="/t/$slug" params={{ slug: tournament.slug }} />}
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground -ml-2"
				>
					<ArrowLeftIcon className="size-3.5" />
					<span>{tournament.name}</span>
				</Button>
			</div>

			{/* HEADER TỈ SỐ LỚN (Big Score Header) */}
			<Card
				className={cn(
					"p-5 md:p-8 border mb-8 transition-all relative overflow-hidden",
					isTieLive && "ring-1 ring-live/60 border-live/40 bg-live/[0.02]",
					isTieFinished && "bg-card border-border",
				)}
			>
				{/* Top metadata */}
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3 mb-6 text-xs">
					<div className="flex items-center gap-2">
						<span className="font-heading font-semibold text-foreground text-sm">
							{tie.round_label}
						</span>
						{tie.stage === "knockout" && (
							<Badge
								variant="outline"
								className="text-[10px] uppercase font-mono"
							>
								Phân hạng / Chung kết
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-3">
						{tie.court && (
							<span className="inline-flex items-center gap-1 text-muted-foreground font-medium text-xs">
								<MapPinIcon className="size-3.5 text-primary/70 shrink-0" />
								{tie.court}
							</span>
						)}
						{tie.scheduled_at && !isTieLive && (
							<span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-mono">
								<CalendarDaysIcon className="size-3.5 shrink-0" />
								{formatDateTime(tie.scheduled_at)}
							</span>
						)}
						{isTieLive && <LiveBadge />}
						{isTieFinished && (
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

				{/* 2 Đội và Tỉ số Tie Cỡ Lớn */}
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8 py-2">
					{/* Đội A */}
					<div className="flex flex-col items-center md:items-end text-center md:text-right min-w-0">
						<div className="text-xs uppercase tracking-wider font-semibold text-team-a mb-1">
							Đội A
						</div>
						<TeamName
							team={tie.team_a}
							side="a"
							className={cn(
								"text-base md:text-xl",
								winnerA && "text-win font-bold",
							)}
							fallbackText="Chờ xác định đội"
						/>
						{winnerA && (
							<div className="mt-2">
								<Badge variant="win" className="gap-1 text-xs font-bold">
									<CheckIcon className="size-3.5" />
									<span>Thắng Tie</span>
								</Badge>
							</div>
						)}
					</div>

					{/* Tỉ số trung tâm cỡ lớn */}
					<div className="flex flex-col items-center justify-center px-4 py-2 bg-muted/40 border border-border/50 min-w-[100px] md:min-w-[140px]">
						<div className="font-heading font-bold tabular-nums text-4xl md:text-6xl flex items-center gap-2">
							<span className={cn(winnerA ? "text-win" : "text-team-a")}>
								{tie.rubbers_won_a}
							</span>
							<span className="text-muted-foreground/30 select-none font-light">
								:
							</span>
							<span className={cn(winnerB ? "text-win" : "text-team-b")}>
								{tie.rubbers_won_b}
							</span>
						</div>
						<div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mt-1">
							Tỉ số Tie
						</div>
					</div>

					{/* Đội B */}
					<div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0">
						<div className="text-xs uppercase tracking-wider font-semibold text-team-b mb-1">
							Đội B
						</div>
						<TeamName
							team={tie.team_b}
							side="b"
							className={cn(
								"text-base md:text-xl",
								winnerB && "text-win font-bold",
							)}
							fallbackText="Chờ xác định đội"
						/>
						{winnerB && (
							<div className="mt-2">
								<Badge variant="win" className="gap-1 text-xs font-bold">
									<CheckIcon className="size-3.5" />
									<span>Thắng Tie</span>
								</Badge>
							</div>
						)}
					</div>
				</div>

				{/* Chú thích luật nếu có */}
				<div className="mt-6 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground">
					<span>
						{tournament.play_all_rubbers
							? "Thể thức: Đấu trọn vẹn tất cả các trận (không bỏ trận nào)"
							: `Thể thức: Thắng ${tournament.rule_rubbers_to_win_tie} trận trước là thắng tie`}
					</span>
					<span>
						{sortedRubbers.length} trận đấu (
						{sortedRubbers.filter((r) => r.status === "finished").length} đã
						xong)
					</span>
				</div>
			</Card>

			{/* DANH SÁCH CÁC RUBBER THEO POSITION */}
			<div className="space-y-4">
				<div className="flex items-center justify-between border-b border-border/80 pb-2">
					<h2 className="font-heading font-bold text-lg md:text-xl text-foreground flex items-center gap-2">
						<span>Chi tiết các trận đấu</span>
						<span className="text-xs font-sans font-normal text-muted-foreground">
							({sortedRubbers.length} trận)
						</span>
					</h2>
					<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
						<span className="size-2 rounded-full bg-emerald-500 inline-block" />
						<span>Đôi nam nữ</span>
					</div>
				</div>

				{sortedRubbers.length === 0 ? (
					<div className="p-8 text-center border border-dashed text-xs text-muted-foreground">
						Chưa có danh sách trận đấu cho tie này.
					</div>
				) : (
					<div className="grid gap-3.5">
						{sortedRubbers.map((rubber) => {
							const isRubberLive = rubber.status === "live";

							return (
								<div
									key={rubber.id}
									ref={isRubberLive ? liveRubberRef : undefined}
									className="scroll-mt-24"
								>
									<RubberCard
										rubber={rubber}
										teamAName={tie.team_a?.name || "Đội A"}
										teamBName={tie.team_b?.name || "Đội B"}
										playAllRubbers={tournament.play_all_rubbers}
									/>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</main>
	);
}
