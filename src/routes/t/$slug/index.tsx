import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	ClockIcon,
	FilterIcon,
	FlameIcon,
	MapPinIcon,
	MedalIcon,
	TrophyIcon,
	UsersIcon,
} from "lucide-react";
import * as React from "react";
import { LiveBadge } from "@/components/public/LiveBadge";
import { StandingsTable } from "@/components/public/StandingsTable";
import { TeamName } from "@/components/public/TeamName";
import { TieCard } from "@/components/public/TieCard";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublicTournamentData } from "@/hooks/use-public-queries";
import type { Database } from "@/lib/database.types";
import { cn, formatDate } from "@/lib/utils";
import { useTournamentPublic } from "../$slug";

type Tie = Database["public"]["Tables"]["ties"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type Group = Database["public"]["Tables"]["tournament_groups"]["Row"];

export const Route = createFileRoute("/t/$slug/")({
	component: TournamentPublicPage,
});

function TournamentPublicPage() {
	const { tournament } = useTournamentPublic();
	const { data: tourneyData, isLoading } = usePublicTournamentData(
		tournament.id,
	);

	const groups = tourneyData?.groups ?? [];
	const teams = tourneyData?.teams ?? [];
	const players = tourneyData?.players ?? [];
	const ties = tourneyData?.ties ?? [];
	const rubbers = tourneyData?.rubbers ?? [];
	const standings = tourneyData?.standings ?? [];

	const teamMap = React.useMemo(() => {
		const map = new Map<string, Team>();
		for (const t of teams) {
			map.set(t.id, t);
		}
		return map;
	}, [teams]);

	const groupMap = React.useMemo(() => {
		const map = new Map<string, Group>();
		for (const g of groups) {
			map.set(g.id, g);
		}
		return map;
	}, [groups]);

	// Kiểm tra các trận đang trực tiếp (live)
	const liveTies = React.useMemo(() => {
		return ties.filter(
			(t) =>
				t.status === "live" ||
				rubbers.some((r) => r.tie_id === t.id && r.status === "live"),
		);
	}, [ties, rubbers]);

	const hasLiveTies = liveTies.length > 0;

	// State active tab: mặc định "live" nếu có tie live, ngược lại "schedule"
	const [activeTab, setActiveTab] = React.useState<string>(() =>
		hasLiveTies ? "live" : "schedule",
	);

	// Tự động chuyển tab sang live khi có trận live lần đầu nếu chưa chọn tab
	const prevLiveCount = React.useRef(liveTies.length);
	React.useEffect(() => {
		if (prevLiveCount.current === 0 && liveTies.length > 0) {
			setActiveTab("live");
		}
		prevLiveCount.current = liveTies.length;
	}, [liveTies.length]);

	// Filter cho Tab Lịch đấu
	const [scheduleGroupFilter, setScheduleGroupFilter] =
		React.useState<string>("all");
	const [scheduleStageFilter, setScheduleStageFilter] =
		React.useState<string>("all");

	const filteredScheduleTies = React.useMemo(() => {
		return ties.filter((t) => {
			if (scheduleGroupFilter !== "all" && t.group_id !== scheduleGroupFilter) {
				return false;
			}
			if (scheduleStageFilter !== "all" && t.stage !== scheduleStageFilter) {
				return false;
			}
			return true;
		});
	}, [ties, scheduleGroupFilter, scheduleStageFilter]);

	// Xử lý Phân hạng / Chung kết (Placement & Knockout)
	// Phát hiện các trận phân hạng: stage === 'knockout' hoặc có round_order >= 100 hoặc nhãn Tranh Hạng
	const placementTies = React.useMemo(() => {
		return ties.filter(
			(t) =>
				t.stage === "knockout" ||
				(t.round_order && t.round_order >= 100) ||
				t.round_label.toLowerCase().includes("tranh hạng") ||
				t.round_label.toLowerCase().includes("chung kết"),
		);
	}, [ties]);

	// Tính toán dự kiến các đội cho 3 khối phân hạng nếu chưa có tie phân hạng chính thức
	const rankedTeamsFromStandings = React.useMemo(() => {
		if (standings.length === 0) return [];
		return [...standings]
			.sort((a, b) => {
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
			})
			.map((s) => (s.team_id ? teamMap.get(s.team_id) : null))
			.filter((t): t is Team => Boolean(t));
	}, [standings, teamMap]);

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
		<main className="mx-auto min-h-[80vh] max-w-5xl px-4 py-6 md:px-6 md:py-10">
			{/* Breadcrumb / Back button */}
			<div className="mb-4">
				<Button
					render={<Link to="/" />}
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground -ml-2"
				>
					<ArrowLeftIcon className="size-3.5" />
					<span>Danh sách giải</span>
				</Button>
			</div>

			{/* Tournament Header */}
			<div className="mb-8 border-b border-border/80 pb-6">
				<div className="flex flex-wrap items-center gap-2 mb-2">
					{hasLiveTies && <LiveBadge />}
					{/*{isFinished ? (
						<Badge
							variant="outline"
							className="text-muted-foreground text-[11px]"
						>
							Đã kết thúc
						</Badge>
					) : (
						<Badge variant="secondary" className="font-medium text-[11px]">
							Đang diễn ra
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
					{tournament.standings_points_mode === "rubbers_won" && (
						<Badge
							variant="outline"
							className="text-[10px] text-muted-foreground font-mono"
						>
							Tính điểm theo trận nhỏ
						</Badge>
					)}*/}
				</div>

				<h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
					{tournament.name}
				</h1>

				{tournament.description && (
					<p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-3xl">
						{tournament.description}
					</p>
				)}

				<div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-muted-foreground">
					{dateText && (
						<div className="flex items-center gap-1.5">
							<CalendarDaysIcon className="size-4 text-foreground/60 shrink-0" />
							<span>{dateText}</span>
						</div>
					)}
					{tournament.venue && (
						<div className="flex items-center gap-1.5">
							<MapPinIcon className="size-4 text-foreground/60 shrink-0" />
							<span>{tournament.venue}</span>
						</div>
					)}
					<div className="flex items-center gap-1.5 font-medium text-foreground/80 font-mono text-[11px]">
						<UsersIcon className="size-4 text-primary shrink-0" />
						<span>{teams.length} đội tham gia</span>
					</div>
				</div>
			</div>

			{/* Loading State for Data */}
			{isLoading && (
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			)}

			{/* Main Content Tabs */}
			{!isLoading && (
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full space-y-6"
				>
					{/* Tabs Navigation Bar */}
					<div className="overflow-x-auto pb-1">
						<TabsList className="w-full sm:w-auto grid grid-cols-5 min-w-[500px] h-10">
							<TabsTrigger value="live" className="gap-1.5 text-xs md:text-sm">
								<FlameIcon className="size-3.5 text-live shrink-0" />
								<span>Trực tiếp</span>
								{hasLiveTies && (
									<span className="size-1.5 rounded-full bg-live animate-pulse" />
								)}
							</TabsTrigger>
							<TabsTrigger
								value="schedule"
								className="gap-1.5 text-xs md:text-sm"
							>
								<CalendarDaysIcon className="size-3.5 shrink-0" />
								<span>Lịch đấu</span>
							</TabsTrigger>
							<TabsTrigger
								value="standings"
								className="gap-1.5 text-xs md:text-sm"
							>
								<TrophyIcon className="size-3.5 shrink-0" />
								<span>Bảng xếp hạng</span>
							</TabsTrigger>
							<TabsTrigger
								value="placements"
								className="gap-1.5 text-xs md:text-sm"
							>
								<MedalIcon className="size-3.5 shrink-0" />
								<span>Phân hạng</span>
							</TabsTrigger>
							<TabsTrigger value="teams" className="gap-1.5 text-xs md:text-sm">
								<UsersIcon className="size-3.5 shrink-0" />
								<span>Đội &amp; VĐV</span>
							</TabsTrigger>
						</TabsList>
					</div>

					{/* 1. TAB: TRỰC TIẾP (Live) */}
					<TabsContent value="live" className="space-y-4 outline-none">
						{liveTies.length === 0 ? (
							<Empty className="py-12 border bg-muted/10">
								<EmptyMedia variant="icon">
									<ClockIcon className="size-6 text-muted-foreground" />
								</EmptyMedia>
								<EmptyHeader>
									<EmptyTitle>Không có trận đấu đang trực tiếp</EmptyTitle>
									<EmptyDescription>
										Hiện tại chưa có trận đấu nào đang diễn ra. Bạn có thể xem
										lịch thi đấu để biết thời gian các trận sắp tới.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setActiveTab("schedule")}
										className="text-xs"
									>
										Xem lịch thi đấu
									</Button>
								</EmptyContent>
							</Empty>
						) : (
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-live">
									<span className="size-2 rounded-full bg-live animate-pulse" />
									<span>Đang diễn ra ({liveTies.length} trận đồng đội)</span>
								</div>
								<div className="grid gap-4">
									{liveTies.map((tie) => (
										<TieCard
											key={tie.id}
											slug={tournament.slug}
											tie={tie}
											teamA={tie.team_a_id ? teamMap.get(tie.team_a_id) : null}
											teamB={tie.team_b_id ? teamMap.get(tie.team_b_id) : null}
											rubbers={rubbers}
										/>
									))}
								</div>
							</div>
						)}
					</TabsContent>

					{/* 2. TAB: LỊCH ĐẤU (Schedule) */}
					<TabsContent value="schedule" className="space-y-4 outline-none">
						{/* Bộ lọc bảng & giai đoạn */}
						<div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/20 border border-border/60">
							<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
								<FilterIcon className="size-3.5 text-foreground/70" />
								<span>Bộ lọc:</span>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								{/* Lọc Bảng */}
								{groups.length > 1 && (
									<div className="flex items-center gap-1 text-xs">
										<button
											type="button"
											onClick={() => setScheduleGroupFilter("all")}
											className={cn(
												"px-2.5 py-1 text-xs font-medium border transition-colors",
												scheduleGroupFilter === "all"
													? "bg-primary text-primary-foreground border-primary"
													: "bg-background text-muted-foreground border-border hover:bg-muted",
											)}
										>
											Tất cả bảng
										</button>
										{groups.map((g) => (
											<button
												key={g.id}
												type="button"
												onClick={() => setScheduleGroupFilter(g.id)}
												className={cn(
													"px-2.5 py-1 text-xs font-medium border transition-colors",
													scheduleGroupFilter === g.id
														? "bg-primary text-primary-foreground border-primary"
														: "bg-background text-muted-foreground border-border hover:bg-muted",
												)}
											>
												{g.name}
											</button>
										))}
									</div>
								)}

								{/* Lọc Giai đoạn */}
								<div className="flex items-center gap-1 text-xs">
									<button
										type="button"
										onClick={() => setScheduleStageFilter("all")}
										className={cn(
											"px-2.5 py-1 text-xs font-medium border transition-colors",
											scheduleStageFilter === "all"
												? "bg-secondary text-secondary-foreground border-secondary font-semibold"
												: "bg-background text-muted-foreground border-border hover:bg-muted",
										)}
									>
										Tất cả vòng
									</button>
									<button
										type="button"
										onClick={() => setScheduleStageFilter("group")}
										className={cn(
											"px-2.5 py-1 text-xs font-medium border transition-colors",
											scheduleStageFilter === "group"
												? "bg-secondary text-secondary-foreground border-secondary font-semibold"
												: "bg-background text-muted-foreground border-border hover:bg-muted",
										)}
									>
										Vòng bảng
									</button>
									<button
										type="button"
										onClick={() => setScheduleStageFilter("knockout")}
										className={cn(
											"px-2.5 py-1 text-xs font-medium border transition-colors",
											scheduleStageFilter === "knockout"
												? "bg-secondary text-secondary-foreground border-secondary font-semibold"
												: "bg-background text-muted-foreground border-border hover:bg-muted",
										)}
									>
										Phân hạng &amp; Knockout
									</button>
								</div>
							</div>
						</div>

						{/* Danh sách Ties */}
						{filteredScheduleTies.length === 0 ? (
							<Empty className="py-12 border bg-muted/10">
								<EmptyHeader>
									<EmptyTitle>Chưa có trận đấu phù hợp</EmptyTitle>
									<EmptyDescription>
										Không tìm thấy trận đấu nào theo bộ lọc đã chọn.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : (
							<div className="grid gap-3">
								{filteredScheduleTies.map((tie) => (
									<TieCard
										key={tie.id}
										slug={tournament.slug}
										tie={tie}
										teamA={tie.team_a_id ? teamMap.get(tie.team_a_id) : null}
										teamB={tie.team_b_id ? teamMap.get(tie.team_b_id) : null}
										rubbers={rubbers}
									/>
								))}
							</div>
						)}
					</TabsContent>

					{/* 3. TAB: BẢNG XẾP HẠNG (Standings) */}
					<TabsContent value="standings" className="space-y-6 outline-none">
						{groups.length === 0 ? (
							<div className="space-y-3">
								<h2 className="font-heading font-semibold text-base text-foreground">
									Bảng tổng sắp
								</h2>
								<StandingsTable
									standings={standings}
									teams={teams}
									pointsMode={tournament.standings_points_mode}
								/>
							</div>
						) : (
							groups.map((group) => {
								const groupStandings = standings.filter(
									(s) => s.group_id === group.id,
								);
								const groupTeams = teams.filter((t) => t.group_id === group.id);
								return (
									<div key={group.id} className="space-y-2.5">
										<div className="flex items-center justify-between border-b border-border pb-2">
											<h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
												<span>{group.name}</span>
												<span className="text-xs font-normal text-muted-foreground font-sans">
													({groupTeams.length} đội)
												</span>
											</h2>
										</div>
										<StandingsTable
											standings={groupStandings}
											teams={groupTeams}
											pointsMode={tournament.standings_points_mode}
										/>
									</div>
								);
							})
						)}
					</TabsContent>

					{/* 4. TAB: PHÂN HẠNG & CHUNG KẾT (Placements / Knockout) */}
					<TabsContent value="placements" className="space-y-6 outline-none">
						<div className="border-b border-border pb-3">
							<h2 className="font-heading font-bold text-lg md:text-xl text-foreground">
								Vòng phân hạng thứ bậc &amp; Chung kết
							</h2>
							<p className="text-xs text-muted-foreground mt-1">
								Các cặp đấu tranh huy chương và thứ hạng chung cuộc dựa trên kết
								quả vòng bảng.
							</p>
						</div>

						{/* 3 Khối Phân Hạng: Tranh 1-2, Tranh 3-4, Tranh 5-6 */}
						<div className="grid gap-6">
							{/* Khối 1: Chung kết Tranh 1-2 (Vàng / Bạc) */}
							<PlacementBlock
								title="Chung kết: Tranh Hạng 1–2"
								badgeText="Vô địch & Á quân"
								badgeVariant="win"
								accentColor="border-amber-500/50 bg-amber-500/[0.03]"
								tie={placementTies.find(
									(t) =>
										t.round_order === 101 ||
										t.round_label.includes("1–2") ||
										t.round_label.includes("1-2"),
								)}
								slug={tournament.slug}
								teamMap={teamMap}
								rubbers={rubbers}
								previewTeamA={rankedTeamsFromStandings[0]}
								previewTeamB={rankedTeamsFromStandings[1]}
								previewRankA="Hạng 1 BXH"
								previewRankB="Hạng 2 BXH"
							/>

							{/* Khối 2: Tranh Hạng 3-4 (Đồng) */}
							<PlacementBlock
								title="Tranh Hạng 3–4"
								badgeText="Hạng Ba"
								badgeVariant="secondary"
								accentColor="border-blue-500/40 bg-blue-500/[0.02]"
								tie={placementTies.find(
									(t) =>
										t.round_order === 102 ||
										t.round_label.includes("3–4") ||
										t.round_label.includes("3-4"),
								)}
								slug={tournament.slug}
								teamMap={teamMap}
								rubbers={rubbers}
								previewTeamA={rankedTeamsFromStandings[2]}
								previewTeamB={rankedTeamsFromStandings[3]}
								previewRankA="Hạng 3 BXH"
								previewRankB="Hạng 4 BXH"
							/>

							{/* Khối 3: Tranh Hạng 5-6 */}
							<PlacementBlock
								title="Tranh Hạng 5–6"
								badgeText="Hạng Năm & Sáu"
								badgeVariant="outline"
								accentColor="border-border bg-card"
								tie={placementTies.find(
									(t) =>
										t.round_order === 103 ||
										t.round_label.includes("5–6") ||
										t.round_label.includes("5-6"),
								)}
								slug={tournament.slug}
								teamMap={teamMap}
								rubbers={rubbers}
								previewTeamA={rankedTeamsFromStandings[4]}
								previewTeamB={rankedTeamsFromStandings[5]}
								previewRankA="Hạng 5 BXH"
								previewRankB="Hạng 6 BXH"
							/>
						</div>

						{/* Nếu có các trận knockout truyền thống khác ngoài 3 trận trên */}
						{placementTies.filter(
							(t) =>
								t.round_order !== 101 &&
								t.round_order !== 102 &&
								t.round_order !== 103 &&
								!t.round_label.includes("1–2") &&
								!t.round_label.includes("3–4") &&
								!t.round_label.includes("5–6"),
						).length > 0 && (
							<div className="mt-8 pt-6 border-t border-border space-y-3">
								<h3 className="font-heading font-semibold text-base">
									Các trận đấu knockout khác
								</h3>
								<div className="grid gap-3">
									{placementTies
										.filter(
											(t) =>
												t.round_order !== 101 &&
												t.round_order !== 102 &&
												t.round_order !== 103 &&
												!t.round_label.includes("1–2") &&
												!t.round_label.includes("3–4") &&
												!t.round_label.includes("5–6"),
										)
										.map((tie) => (
											<TieCard
												key={tie.id}
												slug={tournament.slug}
												tie={tie}
												teamA={
													tie.team_a_id ? teamMap.get(tie.team_a_id) : null
												}
												teamB={
													tie.team_b_id ? teamMap.get(tie.team_b_id) : null
												}
												rubbers={rubbers}
											/>
										))}
								</div>
							</div>
						)}
					</TabsContent>

					{/* 5. TAB: ĐỘI & VẬN ĐỘNG VIÊN (Teams) */}
					<TabsContent value="teams" className="space-y-6 outline-none">
						<div className="border-b border-border pb-3">
							<h2 className="font-heading font-bold text-lg md:text-xl text-foreground">
								Danh sách đội và vận động viên ({teams.length} đội,{" "}
								{players.length} VĐV)
							</h2>
						</div>

						{teams.length === 0 ? (
							<Empty className="py-12 border bg-muted/10">
								<EmptyHeader>
									<EmptyTitle>Chưa có danh sách đội</EmptyTitle>
									<EmptyDescription>
										Ban tổ chức chưa thêm đội tham gia vào giải đấu này.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								{teams.map((team) => {
									const teamPlayers = players
										.filter((p) => p.team_id === team.id)
										.sort((a, b) => a.sort_order - b.sort_order);
									const group = team.group_id
										? groupMap.get(team.group_id)
										: null;

									return (
										<Card
											key={team.id}
											className="p-4 border bg-card flex flex-col justify-between"
										>
											<div>
												{/* Team Header */}
												<div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
													<div className="flex items-center gap-2 min-w-0">
														<span className="text-xl select-none shrink-0">
															{team.flag_emoji || "🏸"}
														</span>
														<div className="min-w-0">
															<h3 className="font-heading font-bold text-base truncate text-foreground">
																{team.name}
															</h3>
															{team.short_name &&
																team.short_name !== team.name && (
																	<span className="text-[11px] text-muted-foreground font-mono">
																		Mã: {team.short_name}
																	</span>
																)}
														</div>
													</div>

													<div className="flex items-center gap-1.5 shrink-0">
														{group && (
															<Badge
																variant="secondary"
																className="font-medium text-[11px]"
															>
																{group.name}
															</Badge>
														)}
														{team.seed != null && (
															<Badge
																variant="outline"
																className="font-mono text-[11px] border-primary/40 text-primary"
															>
																Hạt giống #{team.seed}
															</Badge>
														)}
													</div>
												</div>

												{/* Player Roster */}
												<div className="space-y-1.5">
													<div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
														Danh sách VĐV ({teamPlayers.length})
													</div>
													{teamPlayers.length === 0 ? (
														<p className="text-xs text-muted-foreground italic">
															Chưa đăng ký danh sách VĐV
														</p>
													) : (
														<div className="grid grid-cols-2 gap-1.5">
															{teamPlayers.map((player) => (
																<div
																	key={player.id}
																	className="flex items-center justify-between gap-1 p-1.5 bg-muted/30 border border-border/40 text-xs"
																>
																	<span className="truncate font-medium text-foreground">
																		{player.full_name}
																	</span>
																	{player.gender && (
																		<span
																			className={cn(
																				"text-[10px] font-mono shrink-0 px-1 py-0.2 border",
																				player.gender === "f"
																					? "border-pink-500/40 text-pink-600 dark:text-pink-400 bg-pink-500/10"
																					: "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10",
																			)}
																		>
																			{player.gender === "f" ? "Nữ" : "Nam"}
																		</span>
																	)}
																</div>
															))}
														</div>
													)}
												</div>
											</div>
										</Card>
									);
								})}
							</div>
						)}
					</TabsContent>
				</Tabs>
			)}
		</main>
	);
}

/**
 * Component hiển thị 1 khối trận phân hạng (1-2, 3-4, 5-6)
 */
function PlacementBlock({
	title,
	badgeText,
	badgeVariant = "outline",
	accentColor,
	tie,
	slug,
	teamMap,
	rubbers,
	previewTeamA,
	previewTeamB,
	previewRankA,
	previewRankB,
}: {
	title: string;
	badgeText: string;
	badgeVariant?: "default" | "secondary" | "outline" | "win";
	accentColor?: string;
	tie?: Tie;
	slug: string;
	teamMap: Map<string, Team>;
	rubbers: Database["public"]["Tables"]["rubbers"]["Row"][];
	previewTeamA?: Team;
	previewTeamB?: Team;
	previewRankA: string;
	previewRankB: string;
}) {
	return (
		<div className={cn("border p-4 space-y-3", accentColor)}>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
				<h3 className="font-heading font-bold text-base md:text-lg flex items-center gap-2">
					<span>{title}</span>
				</h3>
				<Badge variant={badgeVariant} className="font-medium text-xs">
					{badgeText}
				</Badge>
			</div>

			{tie ? (
				<TieCard
					slug={slug}
					tie={tie}
					teamA={tie.team_a_id ? teamMap.get(tie.team_a_id) : null}
					teamB={tie.team_b_id ? teamMap.get(tie.team_b_id) : null}
					rubbers={rubbers}
				/>
			) : (
				<div className="p-4 bg-muted/20 border border-dashed border-border/80 text-center space-y-3">
					<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
						<div className="flex flex-col items-center">
							<span className="text-[11px] text-muted-foreground uppercase font-mono mb-1">
								{previewRankA}
							</span>
							<TeamName team={previewTeamA} side="a" />
						</div>

						<div className="font-heading font-bold text-lg text-muted-foreground/60 select-none">
							VS
						</div>

						<div className="flex flex-col items-center">
							<span className="text-[11px] text-muted-foreground uppercase font-mono mb-1">
								{previewRankB}
							</span>
							<TeamName team={previewTeamB} side="b" />
						</div>
					</div>
					<p className="text-[11px] text-muted-foreground italic">
						* Cặp đấu sẽ chính thức được kích hoạt sau khi vòng bảng hoàn tất.
					</p>
				</div>
			)}
		</div>
	);
}
