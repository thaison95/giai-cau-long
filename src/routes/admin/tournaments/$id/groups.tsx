import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRightLeftIcon,
	GridIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useTournamentAdmin } from "../$id";

type Group = Database["public"]["Tables"]["tournament_groups"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

export const Route = createFileRoute("/admin/tournaments/$id/groups")({
	component: GroupsManagementPage,
});

function GroupsManagementPage() {
	const { tournament } = useTournamentAdmin();

	// 1. Lấy danh sách bảng đấu và danh sách đội
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin", "groups-and-teams", tournament.id],
		queryFn: async () => {
			const [groupsRes, teamsRes] = await Promise.all([
				supabase
					.from("tournament_groups")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("sort_order", { ascending: true })
					.order("name", { ascending: true }),
				supabase
					.from("teams")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("name", { ascending: true }),
			]);

			if (groupsRes.error) throw groupsRes.error;
			if (teamsRes.error) throw teamsRes.error;

			return {
				groups: (groupsRes.data ?? []) as Group[],
				teams: (teamsRes.data ?? []) as Team[],
			};
		},
	});

	const groups = data?.groups ?? [];
	const teams = data?.teams ?? [];

	// Phân nhóm đội theo group_id
	const teamsByGroup = React.useMemo(() => {
		const map = new Map<string, Team[]>();
		for (const team of teams) {
			if (team.group_id) {
				const list = map.get(team.group_id) || [];
				list.push(team);
				map.set(team.group_id, list);
			}
		}
		return map;
	}, [teams]);

	const unassignedTeams = React.useMemo(() => {
		return teams.filter((t) => !t.group_id);
	}, [teams]);

	// Dialog State cho Bảng
	const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);
	const [editingGroup, setEditingGroup] = React.useState<Group | null>(null);
	const [groupName, setGroupName] = React.useState("");
	const [groupSortOrder, setGroupSortOrder] = React.useState<number>(0);
	const [submittingGroup, setSubmittingGroup] = React.useState(false);

	// Dialog Xóa Bảng
	const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] =
		React.useState(false);
	const [groupToDelete, setGroupToDelete] = React.useState<Group | null>(null);
	const [deletingGroup, setDeletingGroup] = React.useState(false);

	// Dialog Chuyển Bảng cho Đội
	const [moveTeamDialogOpen, setMoveTeamDialogOpen] = React.useState(false);
	const [teamToMove, setTeamToMove] = React.useState<Team | null>(null);
	const [targetGroupId, setTargetGroupId] = React.useState<string | "">("");
	const [movingTeam, setMovingTeam] = React.useState(false);

	const handleOpenCreateGroup = () => {
		setEditingGroup(null);
		// Tự gợi ý tên bảng tiếp theo (ví dụ: "Bảng A", "Bảng B"...)
		const nextChar = String.fromCharCode(65 + groups.length);
		setGroupName(`Bảng ${nextChar}`);
		setGroupSortOrder(groups.length + 1);
		setGroupDialogOpen(true);
	};

	const handleOpenEditGroup = (g: Group) => {
		setEditingGroup(g);
		setGroupName(g.name);
		setGroupSortOrder(g.sort_order ?? 0);
		setGroupDialogOpen(true);
	};

	const handleSaveGroup = async (e: React.FormEvent) => {
		e.preventDefault();
		const name = groupName.trim();
		if (!name) {
			showRpcError("Vui lòng nhập tên bảng đấu.");
			return;
		}

		setSubmittingGroup(true);
		try {
			if (editingGroup) {
				const { error } = await supabase
					.from("tournament_groups")
					.update({
						name,
						sort_order: groupSortOrder,
					})
					.eq("id", editingGroup.id);

				if (error) throw error;
				toastSuccess("Cập nhật bảng đấu thành công!");
			} else {
				const { error } = await supabase.from("tournament_groups").insert({
					tournament_id: tournament.id,
					name,
					sort_order: groupSortOrder,
				});

				if (error) throw error;
				toastSuccess("Tạo bảng đấu mới thành công!");
			}

			setGroupDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingGroup(false);
		}
	};

	const handleDeleteGroup = async () => {
		if (!groupToDelete) return;
		setDeletingGroup(true);
		try {
			// Postgres FK có ON DELETE SET NULL, nên xóa bảng sẽ gán teams.group_id về null
			const { error } = await supabase
				.from("tournament_groups")
				.delete()
				.eq("id", groupToDelete.id);

			if (error) throw error;
			toastSuccess(
				`Đã xóa ${groupToDelete.name}. Các đội trong bảng đã được chuyển về chưa xếp bảng.`,
			);
			setDeleteGroupDialogOpen(false);
			setGroupToDelete(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeletingGroup(false);
		}
	};

	// Chuyển hoặc gán bảng cho đội
	const handleAssignTeamToGroup = async (
		teamId: string,
		newGroupId: string | null,
	) => {
		try {
			const { error } = await supabase
				.from("teams")
				.update({ group_id: newGroupId })
				.eq("id", teamId);

			if (error) throw error;
			toastSuccess("Đã cập nhật bảng đấu cho đội!");
			refetch();
		} catch (err) {
			showRpcError(err);
		}
	};

	const handleSaveMoveTeam = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!teamToMove) return;

		setMovingTeam(true);
		try {
			const newGroupId = targetGroupId ? targetGroupId : null;
			await handleAssignTeamToGroup(teamToMove.id, newGroupId);
			setMoveTeamDialogOpen(false);
			setTeamToMove(null);
		} finally {
			setMovingTeam(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div>
					<h2 className="font-heading text-lg font-bold text-foreground">
						Bảng đấu & Phân bổ đội
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Tạo các bảng đấu (Bảng A, B...) và xếp các đội vào từng bảng.
					</p>
				</div>
				<Button
					onClick={handleOpenCreateGroup}
					className="gap-1.5 self-start sm:self-auto text-xs"
				>
					<PlusIcon className="size-4" />
					<span>Tạo bảng mới</span>
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2].map((i) => (
						<Card key={i} className="p-4 space-y-3">
							<div className="h-5 w-32 bg-muted animate-pulse" />
							<div className="h-24 w-full bg-muted animate-pulse" />
						</Card>
					))}
				</div>
			) : groups.length === 0 ? (
				<Empty className="border border-dashed py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<GridIcon className="size-6 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>Chưa có bảng đấu nào</EmptyTitle>
						<EmptyDescription>
							Hãy tạo bảng đấu đầu tiên (ví dụ: Bảng A, Bảng B) để bắt đầu phân
							bổ các đội tham gia.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={handleOpenCreateGroup} className="gap-1.5 text-xs">
							<PlusIcon className="size-4" />
							Tạo bảng đầu tiên
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="space-y-6">
					{/* Danh sách các bảng đấu */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{groups.map((group) => {
							const groupTeams = teamsByGroup.get(group.id) || [];

							return (
								<Card key={group.id} className="flex flex-col justify-between">
									<CardHeader className="bg-muted/30 border-b border-border py-2.5 px-4 flex flex-row items-center justify-between">
										<div>
											<CardTitle className="text-sm font-semibold text-foreground">
												{group.name}
											</CardTitle>
											<p className="text-[11px] text-muted-foreground mt-0.5">
												{groupTeams.length} đội trong bảng
											</p>
										</div>

										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => handleOpenEditGroup(group)}
												title="Đổi tên bảng"
											>
												<PencilIcon className="size-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => {
													setGroupToDelete(group);
													setDeleteGroupDialogOpen(true);
												}}
												className="text-destructive hover:text-destructive"
												title="Xóa bảng"
											>
												<Trash2Icon className="size-3.5" />
											</Button>
										</div>
									</CardHeader>

									<CardContent className="p-4 flex-1">
										{groupTeams.length === 0 ? (
											<div className="rounded-none border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
												Chưa có đội nào trong bảng này.
											</div>
										) : (
											<div className="space-y-2">
												{groupTeams.map((team, idx) => (
													<div
														key={team.id}
														className="flex items-center justify-between p-2 border border-border bg-background text-xs group hover:border-foreground/30 transition-colors"
													>
														<div className="flex items-center gap-2 min-w-0">
															<span className="font-mono text-muted-foreground text-[11px] w-4">
																{idx + 1}.
															</span>
															<span className="text-base leading-none">
																{team.flag_emoji || "🏸"}
															</span>
															<span className="font-medium text-foreground truncate">
																{team.name}
															</span>
															<Badge
																variant="outline"
																className="font-mono text-[10px] h-4 px-1"
															>
																{team.short_name}
															</Badge>
															{team.seed && (
																<Badge
																	variant="secondary"
																	className="text-[10px] h-4 px-1"
																>
																	#{team.seed}
																</Badge>
															)}
														</div>

														<div className="flex items-center gap-1">
															<Button
																variant="ghost"
																size="icon-xs"
																onClick={() => {
																	setTeamToMove(team);
																	setTargetGroupId(team.group_id || "");
																	setMoveTeamDialogOpen(true);
																}}
																className="text-muted-foreground hover:text-foreground"
																title="Chuyển bảng"
															>
																<ArrowRightLeftIcon className="size-3.5" />
															</Button>
															<Button
																variant="ghost"
																size="icon-xs"
																onClick={() =>
																	handleAssignTeamToGroup(team.id, null)
																}
																className="text-muted-foreground hover:text-destructive"
																title="Rời khỏi bảng"
															>
																<XIcon className="size-3.5" />
															</Button>
														</div>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Danh sách các đội chưa xếp bảng */}
					{unassignedTeams.length > 0 && (
						<Card className="border-warning/30 bg-warning/5">
							<CardHeader className="py-3 px-4 border-b border-warning/20">
								<CardTitle className="text-xs font-semibold text-warning flex items-center justify-between">
									<span>Đội chưa xếp bảng ({unassignedTeams.length} đội)</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
									{unassignedTeams.map((team) => (
										<div
											key={team.id}
											className="flex items-center justify-between p-2 border border-border bg-background text-xs"
										>
											<div className="flex items-center gap-2 min-w-0">
												<span className="text-base leading-none">
													{team.flag_emoji || "🏸"}
												</span>
												<span className="font-medium truncate">
													{team.name}
												</span>
												<Badge
													variant="outline"
													className="font-mono text-[10px] h-4 px-1"
												>
													{team.short_name}
												</Badge>
											</div>

											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setTeamToMove(team);
													setTargetGroupId(groups[0]?.id || "");
													setMoveTeamDialogOpen(true);
												}}
												className="text-xs h-6 px-2"
											>
												Xếp bảng
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* Dialog Tạo / Sửa Bảng */}
			<Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingGroup ? "Chỉnh sửa bảng đấu" : "Tạo bảng đấu mới"}
						</DialogTitle>
						<DialogDescription>
							Nhập tên bảng đấu (ví dụ: Bảng A, Bảng B...).
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveGroup} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="groupName"
								className="text-xs font-medium text-foreground"
							>
								Tên bảng đấu <span className="text-destructive">*</span>
							</label>
							<Input
								id="groupName"
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="Bảng A"
								required
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="groupSortOrder"
								className="text-xs font-medium text-foreground"
							>
								Thứ tự sắp xếp
							</label>
							<Input
								id="groupSortOrder"
								type="number"
								value={groupSortOrder}
								onChange={(e) => setGroupSortOrder(Number(e.target.value))}
							/>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setGroupDialogOpen(false)}
								disabled={submittingGroup}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={submittingGroup}>
								{submittingGroup
									? "Đang lưu..."
									: editingGroup
										? "Lưu thay đổi"
										: "Tạo bảng"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xóa Bảng */}
			<AlertDialog
				open={deleteGroupDialogOpen}
				onOpenChange={setDeleteGroupDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa bảng {groupToDelete?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này sẽ xóa bảng <strong>{groupToDelete?.name}</strong>.
							Các đội trong bảng sẽ được chuyển về trạng thái{" "}
							<strong>chưa xếp bảng</strong> mà{" "}
							<em>không bị xóa khỏi giải đấu</em>.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletingGroup}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteGroup}
							disabled={deletingGroup}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deletingGroup ? "Đang xóa..." : "Xác nhận xóa bảng"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Dialog Xếp / Chuyển Bảng Cho Đội */}
			<Dialog open={moveTeamDialogOpen} onOpenChange={setMoveTeamDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Xếp bảng cho đội {teamToMove?.name}</DialogTitle>
						<DialogDescription>
							Chọn bảng đấu muốn phân bổ cho đội.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveMoveTeam} className="space-y-4 pt-2">
						<div className="space-y-2">
							<span className="block text-xs font-medium text-foreground">
								Chọn bảng đấu:
							</span>
							<div className="space-y-1.5">
								{groups.map((g) => (
									<label
										key={g.id}
										className="flex items-center gap-2 p-2 border border-border hover:bg-muted/40 cursor-pointer text-xs"
									>
										<input
											type="radio"
											name="targetGroup"
											value={g.id}
											checked={targetGroupId === g.id}
											onChange={() => setTargetGroupId(g.id)}
											className="size-4 text-primary"
										/>
										<span className="font-medium text-foreground">
											{g.name}
										</span>
										<span className="text-[11px] text-muted-foreground ml-auto">
											{(teamsByGroup.get(g.id) || []).length} đội hiện tại
										</span>
									</label>
								))}

								<label className="flex items-center gap-2 p-2 border border-dashed border-border hover:bg-muted/40 cursor-pointer text-xs">
									<input
										type="radio"
										name="targetGroup"
										value=""
										checked={targetGroupId === ""}
										onChange={() => setTargetGroupId("")}
										className="size-4 text-primary"
									/>
									<span className="text-muted-foreground">
										Chưa xếp bảng (Hủy xếp bảng)
									</span>
								</label>
							</div>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setMoveTeamDialogOpen(false)}
								disabled={movingTeam}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={movingTeam}>
								{movingTeam ? "Đang lưu..." : "Xác nhận xếp bảng"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
