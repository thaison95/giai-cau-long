import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRightIcon,
	CalendarDaysIcon,
	ClockIcon,
	FilterIcon,
	MapPinIcon,
	PencilIcon,
	PlusIcon,
	RefreshCwIcon,
	Trash2Icon,
} from "lucide-react";
import * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { useTournamentAdmin } from "../../$id";

type Tie = Database["public"]["Tables"]["ties"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type Group = Database["public"]["Tables"]["tournament_groups"]["Row"];
type TieStage = Database["public"]["Enums"]["tie_stage"];

export const Route = createFileRoute("/admin/tournaments/$id/ties/")({
	component: TiesManagementPage,
});

function TiesManagementPage() {
	const { tournament } = useTournamentAdmin();

	// 1. Lấy danh sách ties, teams, groups
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin", "ties-list", tournament.id],
		queryFn: async () => {
			const [tiesRes, teamsRes, groupsRes] = await Promise.all([
				supabase
					.from("ties")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("round_order", { ascending: true })
					.order("scheduled_at", { ascending: true, nullsFirst: false })
					.order("created_at", { ascending: true }),
				supabase
					.from("teams")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("name", { ascending: true }),
				supabase
					.from("tournament_groups")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("sort_order", { ascending: true })
					.order("name", { ascending: true }),
			]);

			if (tiesRes.error) throw tiesRes.error;
			if (teamsRes.error) throw teamsRes.error;
			if (groupsRes.error) throw groupsRes.error;

			return {
				ties: (tiesRes.data ?? []) as Tie[],
				teams: (teamsRes.data ?? []) as Team[],
				groups: (groupsRes.data ?? []) as Group[],
			};
		},
	});

	const ties = data?.ties ?? [];
	const teams = data?.teams ?? [];
	const groups = data?.groups ?? [];

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

	// Bộ lọc
	const [stageFilter, setStageFilter] = React.useState<"all" | TieStage>("all");
	const [groupFilter, setGroupFilter] = React.useState<string>("all");

	const filteredTies = React.useMemo(() => {
		return ties.filter((tie) => {
			if (stageFilter !== "all" && tie.stage !== stageFilter) return false;
			if (groupFilter !== "all" && tie.group_id !== groupFilter) return false;
			return true;
		});
	}, [ties, stageFilter, groupFilter]);

	// Dialog State: Tạo / Sửa Tie
	const [tieDialogOpen, setTieDialogOpen] = React.useState(false);
	const [editingTie, setEditingTie] = React.useState<Tie | null>(null);
	const [stage, setStage] = React.useState<TieStage>("group");
	const [groupId, setGroupId] = React.useState<string>("");
	const [roundLabel, setRoundLabel] = React.useState("");
	const [roundOrder, setRoundOrder] = React.useState(0);
	const [teamAId, setTeamAId] = React.useState<string>("");
	const [teamBId, setTeamBId] = React.useState<string>("");
	const [scheduledAt, setScheduledAt] = React.useState("");
	const [court, setCourt] = React.useState("");
	const [submittingTie, setSubmittingTie] = React.useState(false);

	// Dialog State: Tự động sinh vòng tròn (Round Robin)
	const [roundRobinDialogOpen, setRoundRobinDialogOpen] = React.useState(false);
	const [rrGroupId, setRrGroupId] = React.useState<string>("");
	const [generatingRR, setGeneratingRR] = React.useState(false);

	// Dialog Xóa Tie
	const [deleteTieDialogOpen, setDeleteTieDialogOpen] = React.useState(false);
	const [tieToDelete, setTieToDelete] = React.useState<Tie | null>(null);
	const [deletingTie, setDeletingTie] = React.useState(false);

	const handleOpenCreateTie = () => {
		setEditingTie(null);
		setStage(groups.length > 0 ? "group" : "knockout");
		setGroupId(groups[0]?.id || "");
		setRoundLabel("");
		setRoundOrder(ties.length + 1);
		setTeamAId("");
		setTeamBId("");
		setScheduledAt("");
		setCourt("");
		setTieDialogOpen(true);
	};

	const handleOpenEditTie = (tie: Tie) => {
		setEditingTie(tie);
		setStage(tie.stage);
		setGroupId(tie.group_id || "");
		setRoundLabel(tie.round_label);
		setRoundOrder(tie.round_order ?? 0);
		setTeamAId(tie.team_a_id || "");
		setTeamBId(tie.team_b_id || "");
		setScheduledAt(
			tie.scheduled_at
				? new Date(tie.scheduled_at).toISOString().slice(0, 16)
				: "",
		);
		setCourt(tie.court || "");
		setTieDialogOpen(true);
	};

	const handleSaveTie = async (e: React.FormEvent) => {
		e.preventDefault();
		const label = roundLabel.trim();
		if (!label) {
			showRpcError(
				"Vui lòng nhập nhãn vòng đấu (ví dụ: Bảng A – Lượt 1, Bán kết 1).",
			);
			return;
		}

		if (stage === "group" && !groupId) {
			showRpcError("Trận vòng bảng bắt buộc phải chọn bảng đấu.");
			return;
		}

		if (teamAId && teamBId && teamAId === teamBId) {
			showRpcError("Đội A và Đội B phải là hai đội khác nhau.");
			return;
		}

		setSubmittingTie(true);
		try {
			const scheduledIso = scheduledAt
				? new Date(scheduledAt).toISOString()
				: null;

			if (editingTie) {
				// Cập nhật tie (chỉ các cột được cấp quyền UPDATE theo RLS)
				const { error } = await supabase
					.from("ties")
					.update({
						stage,
						group_id: stage === "group" ? groupId : null,
						round_label: label,
						round_order: roundOrder,
						team_a_id: teamAId || null,
						team_b_id: teamBId || null,
						scheduled_at: scheduledIso,
						court: court.trim() || null,
					})
					.eq("id", editingTie.id);

				if (error) throw error;
				toastSuccess("Cập nhật trận đấu thành công!");
			} else {
				// Tạo tie mới (Trigger trg_ties_create_rubbers sẽ tự sinh 5 rubber)
				const { error } = await supabase.from("ties").insert({
					tournament_id: tournament.id,
					stage,
					group_id: stage === "group" ? groupId : null,
					round_label: label,
					round_order: roundOrder,
					team_a_id: teamAId || null,
					team_b_id: teamBId || null,
					scheduled_at: scheduledIso,
					court: court.trim() || null,
				});

				if (error) throw error;
				toastSuccess(
					"Tạo trận đấu thành công! Hệ thống đã tự sinh 5 trận theo mẫu giải.",
				);
			}

			setTieDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingTie(false);
		}
	};

	// Tự động sinh vòng tròn cho 1 bảng
	const handleGenerateRoundRobin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!rrGroupId) {
			showRpcError("Vui lòng chọn bảng đấu cần sinh vòng tròn.");
			return;
		}

		const selectedGroup = groupMap.get(rrGroupId);
		if (!selectedGroup) return;

		// Lấy các đội thuộc bảng này
		const groupTeams = teams.filter((t) => t.group_id === rrGroupId);
		if (groupTeams.length < 2) {
			showRpcError(
				`Bảng ${selectedGroup.name} cần ít nhất 2 đội để tạo vòng tròn. Hiện chỉ có ${groupTeams.length} đội.`,
			);
			return;
		}

		setGeneratingRR(true);
		try {
			// 1. Tạo tất cả các cặp đấu (i < j)
			const allPairs: { teamA: Team; teamB: Team }[] = [];
			for (let i = 0; i < groupTeams.length; i++) {
				for (let j = i + 1; j < groupTeams.length; j++) {
					allPairs.push({ teamA: groupTeams[i], teamB: groupTeams[j] });
				}
			}

			// 2. Lấy các tie hiện có trong bảng này để tránh trùng
			const existingTies = ties.filter((t) => t.group_id === rrGroupId);
			const pairExists = (idA: string, idB: string) => {
				return existingTies.some(
					(t) =>
						(t.team_a_id === idA && t.team_b_id === idB) ||
						(t.team_a_id === idB && t.team_b_id === idA),
				);
			};

			const pairsToCreate = allPairs.filter(
				(p) => !pairExists(p.teamA.id, p.teamB.id),
			);

			if (pairsToCreate.length === 0) {
				showRpcError(
					`Tất cả ${allPairs.length} cặp đấu trong ${selectedGroup.name} đều đã được tạo trước đó.`,
				);
				setGeneratingRR(false);
				return;
			}

			// 3. Chuẩn bị payload insert ties
			const baseOrder = ties.length;
			const payload = pairsToCreate.map((pair, idx) => ({
				tournament_id: tournament.id,
				stage: "group" as const,
				group_id: rrGroupId,
				round_label: `${selectedGroup.name} – Trận ${existingTies.length + idx + 1}`,
				round_order: baseOrder + idx + 1,
				team_a_id: pair.teamA.id,
				team_b_id: pair.teamB.id,
			}));

			const { error } = await supabase.from("ties").insert(payload);
			if (error) throw error;

			toastSuccess(
				`Đã tạo tự động thành công ${pairsToCreate.length} trận đấu vòng tròn cho ${selectedGroup.name}!`,
			);
			setRoundRobinDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setGeneratingRR(false);
		}
	};

	const handleDeleteTie = async () => {
		if (!tieToDelete) return;
		setDeletingTie(true);
		try {
			const { error } = await supabase
				.from("ties")
				.delete()
				.eq("id", tieToDelete.id);
			if (error) throw error;
			toastSuccess(`Đã xóa trận ${tieToDelete.round_label}`);
			setDeleteTieDialogOpen(false);
			setTieToDelete(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeletingTie(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div>
					<h2 className="font-heading text-lg font-bold text-foreground">
						Lịch thi đấu (Trận đồng đội - Tie)
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Quản lý các cặp đấu, thời gian, sân bãi và tự động tạo vòng tròn cho
						từng bảng.
					</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					{groups.length > 0 && (
						<Button
							variant="outline"
							onClick={() => {
								setRrGroupId(groups[0]?.id || "");
								setRoundRobinDialogOpen(true);
							}}
							className="gap-1.5 text-xs"
						>
							<RefreshCwIcon className="size-3.5" />
							<span>Tạo vòng tròn cho bảng</span>
						</Button>
					)}
					<Button onClick={handleOpenCreateTie} className="gap-1.5 text-xs">
						<PlusIcon className="size-4" />
						<span>Thêm trận đấu</span>
					</Button>
				</div>
			</div>

			{/* Thanh bộ lọc */}
			<div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 border border-border text-xs">
				<div className="flex items-center gap-1.5 text-muted-foreground">
					<FilterIcon className="size-3.5" />
					<span className="font-medium">Lọc theo:</span>
				</div>

				{/* Lọc giai đoạn */}
				<div className="flex items-center gap-1">
					<Button
						size="sm"
						variant={stageFilter === "all" ? "default" : "outline"}
						onClick={() => setStageFilter("all")}
						className="h-6 px-2 text-[11px]"
					>
						Tất cả ({ties.length})
					</Button>
					<Button
						size="sm"
						variant={stageFilter === "group" ? "default" : "outline"}
						onClick={() => setStageFilter("group")}
						className="h-6 px-2 text-[11px]"
					>
						Vòng bảng ({ties.filter((t) => t.stage === "group").length})
					</Button>
					<Button
						size="sm"
						variant={stageFilter === "knockout" ? "default" : "outline"}
						onClick={() => setStageFilter("knockout")}
						className="h-6 px-2 text-[11px]"
					>
						Loại trực tiếp ({ties.filter((t) => t.stage === "knockout").length})
					</Button>
				</div>

				{/* Lọc theo bảng */}
				{groups.length > 0 && stageFilter !== "knockout" && (
					<div className="flex items-center gap-1 border-l border-border pl-3">
						<span className="text-muted-foreground">Bảng:</span>
						<Button
							size="sm"
							variant={groupFilter === "all" ? "default" : "outline"}
							onClick={() => setGroupFilter("all")}
							className="h-6 px-2 text-[11px]"
						>
							Tất cả bảng
						</Button>
						{groups.map((g) => (
							<Button
								key={g.id}
								size="sm"
								variant={groupFilter === g.id ? "default" : "outline"}
								onClick={() => setGroupFilter(g.id)}
								className="h-6 px-2 text-[11px]"
							>
								{g.name}
							</Button>
						))}
					</div>
				)}
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="p-4 space-y-2">
							<div className="h-5 w-40 bg-muted animate-pulse" />
							<div className="h-8 w-full bg-muted animate-pulse" />
						</Card>
					))}
				</div>
			) : filteredTies.length === 0 ? (
				<Empty className="border border-dashed py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CalendarDaysIcon className="size-6 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>Chưa có trận đấu nào</EmptyTitle>
						<EmptyDescription>
							{ties.length === 0
								? "Hãy thêm trận đấu thủ công hoặc dùng tính năng Tạo vòng tròn để tự động xếp các cặp đấu cho bảng."
								: "Không có trận đấu nào thỏa mãn bộ lọc hiện tại."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{ties.length === 0 && (
							<Button onClick={handleOpenCreateTie} className="gap-1.5 text-xs">
								<PlusIcon className="size-4" />
								Tạo trận đấu đầu tiên
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<div className="space-y-3">
					{filteredTies.map((tie) => {
						const teamA = tie.team_a_id ? teamMap.get(tie.team_a_id) : null;
						const teamB = tie.team_b_id ? teamMap.get(tie.team_b_id) : null;
						const group = tie.group_id ? groupMap.get(tie.group_id) : null;

						return (
							<Card
								key={tie.id}
								className="hover:border-foreground/30 transition-colors overflow-hidden"
							>
								<div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									{/* Cột thông tin trận */}
									<div className="space-y-1.5 flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-mono text-[11px] text-muted-foreground">
												#{tie.round_order}
											</span>
											<span className="font-heading text-xs font-semibold text-foreground">
												{tie.round_label}
											</span>
											{group && (
												<Badge
													variant="outline"
													className="text-[10px] h-4.5 px-1.5"
												>
													{group.name}
												</Badge>
											)}
											<StatusBadge status={tie.status} />
										</div>

										{/* Hai đội thi đấu */}
										<div className="flex items-center gap-3 pt-1">
											<div className="flex items-center gap-1.5 min-w-[120px]">
												<span className="text-base leading-none">
													{teamA?.flag_emoji || "🏸"}
												</span>
												<span
													className={`font-semibold text-xs ${tie.status === "finished" && tie.winner_team_id === tie.team_a_id ? "text-win font-bold" : ""}`}
												>
													{teamA ? teamA.name : "Chờ xác định"}
												</span>
											</div>

											<div className="flex items-center gap-2 px-2.5 py-1 bg-muted font-mono text-xs font-bold text-foreground rounded-none">
												<span>{tie.rubbers_won_a}</span>
												<span className="text-muted-foreground">–</span>
												<span>{tie.rubbers_won_b}</span>
											</div>

											<div className="flex items-center gap-1.5 min-w-[120px]">
												<span className="text-base leading-none">
													{teamB?.flag_emoji || "🏸"}
												</span>
												<span
													className={`font-semibold text-xs ${tie.status === "finished" && tie.winner_team_id === tie.team_b_id ? "text-win font-bold" : ""}`}
												>
													{teamB ? teamB.name : "Chờ xác định"}
												</span>
											</div>
										</div>

										{/* Sân và ngày giờ */}
										<div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
											{tie.scheduled_at && (
												<div className="flex items-center gap-1">
													<ClockIcon className="size-3" />
													<span>{formatDateTime(tie.scheduled_at)}</span>
												</div>
											)}
											{tie.court && (
												<div className="flex items-center gap-1">
													<MapPinIcon className="size-3" />
													<span>{tie.court}</span>
												</div>
											)}
										</div>
									</div>

									{/* Cột thao tác */}
									<div className="flex items-center gap-2 self-end sm:self-center shrink-0">
										<Button
											variant="outline"
											size="sm"
											render={
												<Link
													to="/admin/tournaments/$id/ties/$tieId"
													params={{ id: tournament.id, tieId: tie.id }}
												/>
											}
											className="text-xs h-8 gap-1.5"
										>
											<span>Đội hình & Trọng tài</span>
											<ArrowRightIcon className="size-3.5" />
										</Button>

										<Button
											variant="ghost"
											size="icon-xs"
											onClick={() => handleOpenEditTie(tie)}
											title="Sửa thông tin trận"
										>
											<PencilIcon className="size-3.5" />
										</Button>

										<Button
											variant="ghost"
											size="icon-xs"
											onClick={() => {
												setTieToDelete(tie);
												setDeleteTieDialogOpen(true);
											}}
											className="text-destructive hover:text-destructive"
											title="Xóa trận"
										>
											<Trash2Icon className="size-3.5" />
										</Button>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			)}

			{/* Dialog Tạo / Sửa Tie */}
			<Dialog open={tieDialogOpen} onOpenChange={setTieDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingTie ? "Sửa thông tin trận đấu" : "Tạo trận đồng đội mới"}
						</DialogTitle>
						<DialogDescription>
							{editingTie
								? "Cập nhật giai đoạn, bảng đấu, hai đội hoặc thời gian thi đấu."
								: "Khi tạo trận mới, hệ thống sẽ tự động sinh 5 trận đơn/đôi theo mẫu quy định của giải."}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveTie} className="space-y-4 pt-2">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<span className="block text-xs font-medium text-foreground">
									Giai đoạn
								</span>
								<div className="flex gap-2">
									<Button
										type="button"
										size="sm"
										variant={stage === "group" ? "default" : "outline"}
										onClick={() => setStage("group")}
										className="h-8 text-xs flex-1"
									>
										Vòng bảng
									</Button>
									<Button
										type="button"
										size="sm"
										variant={stage === "knockout" ? "default" : "outline"}
										onClick={() => setStage("knockout")}
										className="h-8 text-xs flex-1"
									>
										Loại trực tiếp
									</Button>
								</div>
							</div>

							{stage === "group" && (
								<div className="space-y-1.5">
									<label
										htmlFor="tieGroup"
										className="text-xs font-medium text-foreground"
									>
										Bảng đấu <span className="text-destructive">*</span>
									</label>
									<select
										id="tieGroup"
										value={groupId}
										onChange={(e) => setGroupId(e.target.value)}
										required
										className="h-8 w-full border border-input bg-background px-2 text-xs"
									>
										<option value="" disabled>
											Chọn bảng...
										</option>
										{groups.map((g) => (
											<option key={g.id} value={g.id}>
												{g.name}
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						<div className="grid grid-cols-3 gap-3">
							<div className="col-span-2 space-y-1.5">
								<label
									htmlFor="roundLabel"
									className="text-xs font-medium text-foreground"
								>
									Nhãn vòng đấu <span className="text-destructive">*</span>
								</label>
								<Input
									id="roundLabel"
									value={roundLabel}
									onChange={(e) => setRoundLabel(e.target.value)}
									placeholder="Ví dụ: Bảng A – Lượt 1, Tứ kết 1"
									required
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="roundOrder"
									className="text-xs font-medium text-foreground"
								>
									Thứ tự sắp xếp
								</label>
								<Input
									id="roundOrder"
									type="number"
									value={roundOrder}
									onChange={(e) => setRoundOrder(Number(e.target.value))}
								/>
							</div>
						</div>

						{/* Chọn hai đội */}
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label
									htmlFor="teamA"
									className="text-xs font-medium text-foreground"
								>
									Đội A{" "}
									{stage === "group" && (
										<span className="text-destructive">*</span>
									)}
								</label>
								<select
									id="teamA"
									value={teamAId}
									onChange={(e) => setTeamAId(e.target.value)}
									required={stage === "group"}
									className="h-8 w-full border border-input bg-background px-2 text-xs"
								>
									<option value="">
										{stage === "knockout" ? "Chờ xác định" : "Chọn Đội A..."}
									</option>
									{teams.map((t) => (
										<option key={t.id} value={t.id}>
											{t.flag_emoji || "🏸"} {t.name} ({t.short_name})
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="teamB"
									className="text-xs font-medium text-foreground"
								>
									Đội B{" "}
									{stage === "group" && (
										<span className="text-destructive">*</span>
									)}
								</label>
								<select
									id="teamB"
									value={teamBId}
									onChange={(e) => setTeamBId(e.target.value)}
									required={stage === "group"}
									className="h-8 w-full border border-input bg-background px-2 text-xs"
								>
									<option value="">
										{stage === "knockout" ? "Chờ xác định" : "Chọn Đội B..."}
									</option>
									{teams.map((t) => (
										<option key={t.id} value={t.id}>
											{t.flag_emoji || "🏸"} {t.name} ({t.short_name})
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Sân và Thời gian */}
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label
									htmlFor="scheduledAt"
									className="text-xs font-medium text-foreground"
								>
									Thời gian thi đấu
								</label>
								<Input
									id="scheduledAt"
									type="datetime-local"
									value={scheduledAt}
									onChange={(e) => setScheduledAt(e.target.value)}
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="court"
									className="text-xs font-medium text-foreground"
								>
									Sân thi đấu
								</label>
								<Input
									id="court"
									value={court}
									onChange={(e) => setCourt(e.target.value)}
									placeholder="Sân 1, Sân Trung Tâm"
								/>
							</div>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setTieDialogOpen(false)}
								disabled={submittingTie}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={submittingTie}>
								{submittingTie
									? "Đang lưu..."
									: editingTie
										? "Lưu thay đổi"
										: "Tạo trận"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Dialog Tạo Tự Động Vòng Tròn (Round Robin) */}
			<Dialog
				open={roundRobinDialogOpen}
				onOpenChange={setRoundRobinDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Tự động tạo vòng tròn cho bảng đấu</DialogTitle>
						<DialogDescription>
							Hệ thống sẽ tự động ghép mọi cặp đấu giữa các đội trong bảng được
							chọn (n×(n-1)/2 trận) và tự sinh 5 rubber cho từng trận. Các cặp
							đấu đã tạo sẽ được bỏ qua.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleGenerateRoundRobin} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="rrGroupSelect"
								className="text-xs font-medium text-foreground"
							>
								Chọn bảng đấu <span className="text-destructive">*</span>
							</label>
							<select
								id="rrGroupSelect"
								value={rrGroupId}
								onChange={(e) => setRrGroupId(e.target.value)}
								required
								className="h-9 w-full border border-input bg-background px-2 text-xs"
							>
								{groups.map((g) => {
									const count = teams.filter((t) => t.group_id === g.id).length;
									return (
										<option key={g.id} value={g.id}>
											{g.name} ({count} đội)
										</option>
									);
								})}
							</select>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setRoundRobinDialogOpen(false)}
								disabled={generatingRR}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={generatingRR}>
								{generatingRR
									? "Đang sinh lịch thi đấu..."
									: "Bắt đầu sinh vòng tròn"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xóa Tie */}
			<AlertDialog
				open={deleteTieDialogOpen}
				onOpenChange={setDeleteTieDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa trận đấu?</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa trận{" "}
							<strong>{tieToDelete?.round_label}</strong>? Toàn bộ 5 trận
							đơn/đôi và tỉ số liên quan sẽ bị xóa vĩnh viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletingTie}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTie}
							disabled={deletingTie}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deletingTie ? "Đang xóa..." : "Xác nhận xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function StatusBadge({ status }: { status: Tie["status"] }) {
	switch (status) {
		case "scheduled":
			return (
				<Badge variant="outline" className="text-[10px] h-4.5">
					Chưa bắt đầu
				</Badge>
			);
		case "live":
			return (
				<Badge variant="live" className="text-[10px] h-4.5">
					Đang thi đấu
				</Badge>
			);
		case "finished":
			return (
				<Badge variant="secondary" className="text-[10px] h-4.5">
					Đã xong
				</Badge>
			);
		default:
			return null;
	}
}
