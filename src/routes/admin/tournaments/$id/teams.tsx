import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	FlagIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	UploadIcon,
	UserPlusIcon,
	UsersIcon,
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
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { useTournamentAdmin } from "../$id";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];
type Group = Database["public"]["Tables"]["tournament_groups"]["Row"];

export const Route = createFileRoute("/admin/tournaments/$id/teams")({
	component: TeamsManagementPage,
});

function TeamsManagementPage() {
	const { tournament } = useTournamentAdmin();

	// 1. Lấy danh sách đội, bảng đấu và VĐV
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin", "teams-and-players", tournament.id],
		queryFn: async () => {
			const [teamsRes, groupsRes, playersRes] = await Promise.all([
				supabase
					.from("teams")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("name", { ascending: true }),
				supabase
					.from("tournament_groups")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("sort_order", { ascending: true }),
				supabase
					.from("players")
					.select("*")
					.eq("tournament_id", tournament.id)
					.order("sort_order", { ascending: true })
					.order("full_name", { ascending: true }),
			]);

			if (teamsRes.error) throw teamsRes.error;
			if (groupsRes.error) throw groupsRes.error;
			if (playersRes.error) throw playersRes.error;

			return {
				teams: (teamsRes.data ?? []) as Team[],
				groups: (groupsRes.data ?? []) as Group[],
				players: (playersRes.data ?? []) as Player[],
			};
		},
	});

	const teams = data?.teams ?? [];
	const groups = data?.groups ?? [];
	const players = data?.players ?? [];

	// Map bảng đấu theo ID để tiện hiển thị
	const groupMap = React.useMemo(() => {
		const map = new Map<string, string>();
		for (const g of groups) {
			map.set(g.id, g.name);
		}
		return map;
	}, [groups]);

	// Gom VĐV theo team_id
	const playersByTeam = React.useMemo(() => {
		const map = new Map<string, Player[]>();
		for (const p of players) {
			const list = map.get(p.team_id) || [];
			list.push(p);
			map.set(p.team_id, list);
		}
		return map;
	}, [players]);

	// Dialog State cho Đội
	const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
	const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);
	const [teamName, setTeamName] = React.useState("");
	const [teamShortName, setTeamShortName] = React.useState("");
	const [teamFlag, setTeamFlag] = React.useState("");
	const [teamSeed, setTeamSeed] = React.useState<string>("");
	const [submittingTeam, setSubmittingTeam] = React.useState(false);

	// Dialog Xóa Đội
	const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = React.useState(false);
	const [teamToDelete, setTeamToDelete] = React.useState<Team | null>(null);
	const [deletingTeam, setDeletingTeam] = React.useState(false);

	// Dialog Thêm VĐV lẻ
	const [singlePlayerDialogOpen, setSinglePlayerDialogOpen] =
		React.useState(false);
	const [targetTeamForPlayer, setTargetTeamForPlayer] =
		React.useState<Team | null>(null);
	const [playerName, setPlayerName] = React.useState("");
	const [playerGender, setPlayerGender] = React.useState<"m" | "f" | "">("");
	const [submittingPlayer, setSubmittingPlayer] = React.useState(false);

	// Dialog Thêm nhanh nhiều VĐV (Batch)
	const [batchPlayerDialogOpen, setBatchPlayerDialogOpen] =
		React.useState(false);
	const [targetTeamForBatch, setTargetTeamForBatch] =
		React.useState<Team | null>(null);
	const [batchNamesText, setBatchNamesText] = React.useState("");
	const [submittingBatch, setSubmittingBatch] = React.useState(false);

	// Xóa VĐV
	const [playerToDelete, setPlayerToDelete] = React.useState<Player | null>(
		null,
	);
	const [deletePlayerDialogOpen, setDeletePlayerDialogOpen] =
		React.useState(false);
	const [deletingPlayer, setDeletingPlayer] = React.useState(false);

	// Mở modal tạo đội
	const handleOpenCreateTeam = () => {
		setEditingTeam(null);
		setTeamName("");
		setTeamShortName("");
		setTeamFlag("🏸");
		setTeamSeed("");
		setTeamDialogOpen(true);
	};

	// Mở modal sửa đội
	const handleOpenEditTeam = (team: Team) => {
		setEditingTeam(team);
		setTeamName(team.name);
		setTeamShortName(team.short_name);
		setTeamFlag(team.flag_emoji || "");
		setTeamSeed(team.seed ? String(team.seed) : "");
		setTeamDialogOpen(true);
	};

	// Lưu thông tin Đội (Tạo mới hoặc Sửa)
	const handleSaveTeam = async (e: React.FormEvent) => {
		e.preventDefault();
		const name = teamName.trim();
		const shortName = teamShortName.trim().toUpperCase();

		if (!name) {
			showRpcError("Vui lòng nhập tên đội.");
			return;
		}

		if (!shortName || !/^[A-Z0-9]{1,4}$/.test(shortName)) {
			showRpcError(
				"Tên viết tắt phải từ 1 đến 4 ký tự in hoa hoặc chữ số (ví dụ: VIE, HN, TQ).",
			);
			return;
		}

		setSubmittingTeam(true);
		try {
			if (editingTeam) {
				// Cập nhật đội
				const { error } = await supabase
					.from("teams")
					.update({
						name,
						short_name: shortName,
						flag_emoji: teamFlag.trim() || null,
						seed: teamSeed ? Number(teamSeed) : null,
					})
					.eq("id", editingTeam.id);

				if (error) throw error;
				toastSuccess("Cập nhật đội thành công!");
			} else {
				// Tạo đội mới
				const { error } = await supabase.from("teams").insert({
					tournament_id: tournament.id,
					name,
					short_name: shortName,
					flag_emoji: teamFlag.trim() || null,
					seed: teamSeed ? Number(teamSeed) : null,
				});

				if (error) throw error;
				toastSuccess("Thêm đội mới thành công!");
			}

			setTeamDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingTeam(false);
		}
	};

	// Xóa Đội
	const handleDeleteTeam = async () => {
		if (!teamToDelete) return;
		setDeletingTeam(true);
		try {
			const { error } = await supabase
				.from("teams")
				.delete()
				.eq("id", teamToDelete.id);
			if (error) throw error;
			toastSuccess(`Đã xóa đội ${teamToDelete.name}`);
			setDeleteTeamDialogOpen(false);
			setTeamToDelete(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeletingTeam(false);
		}
	};

	// Thêm 1 VĐV
	const handleSaveSinglePlayer = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!targetTeamForPlayer) return;
		const name = playerName.trim();
		if (!name) {
			showRpcError("Vui lòng nhập họ tên vận động viên.");
			return;
		}

		setSubmittingPlayer(true);
		try {
			const { error } = await supabase.from("players").insert({
				tournament_id: tournament.id,
				team_id: targetTeamForPlayer.id,
				full_name: name,
				gender: playerGender ? playerGender : null,
			});

			if (error) throw error;
			toastSuccess(`Đã thêm VĐV ${name}`);
			setSinglePlayerDialogOpen(false);
			setPlayerName("");
			setPlayerGender("");
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingPlayer(false);
		}
	};

	// Thêm nhanh nhiều VĐV (Batch)
	const handleSaveBatchPlayers = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!targetTeamForBatch) return;

		const lines = batchNamesText
			.split("\n")
			.map((l) => l.trim())
			.filter((l) => l.length > 0);

		if (lines.length === 0) {
			showRpcError("Vui lòng nhập ít nhất một tên vận động viên.");
			return;
		}

		setSubmittingBatch(true);
		try {
			const payload = lines.map((name, idx) => ({
				tournament_id: tournament.id,
				team_id: targetTeamForBatch.id,
				full_name: name,
				sort_order: idx + 1,
			}));

			const { error } = await supabase.from("players").insert(payload);
			if (error) throw error;

			toastSuccess(
				`Đã thêm thành công ${lines.length} vận động viên vào đội ${targetTeamForBatch.name}!`,
			);
			setBatchPlayerDialogOpen(false);
			setBatchNamesText("");
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingBatch(false);
		}
	};

	// Xóa VĐV
	const handleDeletePlayer = async () => {
		if (!playerToDelete) return;
		setDeletingPlayer(true);
		try {
			const { error } = await supabase
				.from("players")
				.delete()
				.eq("id", playerToDelete.id);
			if (error) throw error;
			toastSuccess(`Đã xóa VĐV ${playerToDelete.full_name}`);
			setDeletePlayerDialogOpen(false);
			setPlayerToDelete(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeletingPlayer(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div>
					<h2 className="font-heading text-lg font-bold text-foreground">
						Đội thi đấu & Vận động viên
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Quản lý các đội tham dự giải và danh sách vận động viên của từng
						đội.
					</p>
				</div>
				<Button
					onClick={handleOpenCreateTeam}
					className="gap-1.5 self-start sm:self-auto text-xs"
				>
					<PlusIcon className="size-4" />
					<span>Thêm đội mới</span>
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{[1, 2].map((i) => (
						<Card key={i} className="p-4 space-y-3">
							<div className="h-5 w-48 bg-muted animate-pulse" />
							<div className="h-4 w-72 bg-muted animate-pulse" />
							<div className="h-20 w-full bg-muted animate-pulse" />
						</Card>
					))}
				</div>
			) : teams.length === 0 ? (
				<Empty className="border border-dashed py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<UsersIcon className="size-6 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>Chưa có đội thi đấu nào</EmptyTitle>
						<EmptyDescription>
							Hãy thêm các đội tham gia giải để bắt đầu xếp bảng và phân bổ vận
							động viên cho từng trận đấu.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={handleOpenCreateTeam} className="gap-1.5 text-xs">
							<PlusIcon className="size-4" />
							Thêm đội đầu tiên
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="space-y-4">
					{teams.map((team) => {
						const teamPlayers = playersByTeam.get(team.id) || [];
						const groupName = team.group_id
							? groupMap.get(team.group_id)
							: null;

						return (
							<Card key={team.id} className="overflow-hidden">
								<CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between gap-2">
									<div className="flex items-center gap-2.5 min-w-0">
										<span
											className="text-lg leading-none"
											role="img"
											aria-label="cờ"
										>
											{team.flag_emoji || "🏸"}
										</span>
										<div className="min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<CardTitle className="text-sm font-semibold truncate">
													{team.name}
												</CardTitle>
												<Badge
													variant="outline"
													className="font-mono text-[10px] h-4.5 px-1.5"
												>
													{team.short_name}
												</Badge>
												{team.seed && (
													<Badge
														variant="secondary"
														className="text-[10px] h-4.5 px-1.5"
													>
														Hạt giống #{team.seed}
													</Badge>
												)}
												{groupName && (
													<Badge
														variant="default"
														className="text-[10px] h-4.5 px-1.5"
													>
														{groupName}
													</Badge>
												)}
											</div>
											<p className="text-[11px] text-muted-foreground mt-0.5">
												{teamPlayers.length} vận động viên
											</p>
										</div>
									</div>

									<div className="flex items-center gap-1 shrink-0">
										<Button
											variant="ghost"
											size="icon-xs"
											onClick={() => handleOpenEditTeam(team)}
											title="Sửa thông tin đội"
										>
											<PencilIcon className="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon-xs"
											onClick={() => {
												setTeamToDelete(team);
												setDeleteTeamDialogOpen(true);
											}}
											className="text-destructive hover:text-destructive"
											title="Xóa đội"
										>
											<Trash2Icon className="size-3.5" />
										</Button>
									</div>
								</CardHeader>

								<CardContent className="p-4 space-y-4">
									{/* Danh sách VĐV của đội */}
									{teamPlayers.length === 0 ? (
										<div className="rounded-none border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
											Chưa có vận động viên nào trong đội này.
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
											{teamPlayers.map((player) => (
												<div
													key={player.id}
													className="flex items-center justify-between p-2 border border-border bg-background text-xs rounded-none group hover:border-foreground/30 transition-colors"
												>
													<div className="flex items-center gap-2 min-w-0">
														<span className="truncate font-medium text-foreground">
															{player.full_name}
														</span>
														{player.gender && (
															<span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded-xs">
																{player.gender === "m" ? "Nam" : "Nữ"}
															</span>
														)}
													</div>
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={() => {
															setPlayerToDelete(player);
															setDeletePlayerDialogOpen(true);
														}}
														className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-5 w-5"
														title="Xóa VĐV"
													>
														<XIcon className="size-3" />
													</Button>
												</div>
											))}
										</div>
									)}

									{/* Nút thêm VĐV */}
									<div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setTargetTeamForPlayer(team);
												setPlayerName("");
												setPlayerGender("");
												setSinglePlayerDialogOpen(true);
											}}
											className="text-xs h-7"
										>
											<UserPlusIcon className="size-3.5 mr-1" />
											Thêm 1 VĐV
										</Button>

										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setTargetTeamForBatch(team);
												setBatchNamesText("");
												setBatchPlayerDialogOpen(true);
											}}
											className="text-xs h-7"
										>
											<UploadIcon className="size-3.5 mr-1" />
											Dán danh sách nhiều VĐV
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Dialog Tạo / Sửa Đội */}
			<Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingTeam ? "Chỉnh sửa thông tin đội" : "Thêm đội thi đấu mới"}
						</DialogTitle>
						<DialogDescription>
							Tên đội và tên viết tắt duy nhất (tối đa 4 ký tự) dùng để hiển thị
							trên bảng tỉ số.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveTeam} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="teamName"
								className="text-xs font-medium text-foreground"
							>
								Tên đội <span className="text-destructive">*</span>
							</label>
							<Input
								id="teamName"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								placeholder="Ví dụ: Đội Hà Nội, Đội Bắc Giang"
								required
								autoFocus
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label
									htmlFor="teamShortName"
									className="text-xs font-medium text-foreground"
								>
									Viết tắt (≤ 4 ký tự){" "}
									<span className="text-destructive">*</span>
								</label>
								<Input
									id="teamShortName"
									value={teamShortName}
									onChange={(e) =>
										setTeamShortName(e.target.value.toUpperCase())
									}
									placeholder="HAN, BG"
									maxLength={4}
									required
									className="font-mono uppercase"
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="teamFlag"
									className="text-xs font-medium text-foreground flex items-center gap-1"
								>
									<FlagIcon className="size-3 text-muted-foreground" />
									Emoji cờ / biểu tượng
								</label>
								<Input
									id="teamFlag"
									value={teamFlag}
									onChange={(e) => setTeamFlag(e.target.value)}
									placeholder="🏸, 🇻🇳, 🔴"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="teamSeed"
								className="text-xs font-medium text-foreground"
							>
								Thứ hạng hạt giống (tùy chọn)
							</label>
							<Input
								id="teamSeed"
								type="number"
								min={1}
								value={teamSeed}
								onChange={(e) => setTeamSeed(e.target.value)}
								placeholder="1, 2, 3..."
							/>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setTeamDialogOpen(false)}
								disabled={submittingTeam}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={submittingTeam}>
								{submittingTeam
									? "Đang lưu..."
									: editingTeam
										? "Lưu thay đổi"
										: "Thêm đội"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xóa Đội */}
			<AlertDialog
				open={deleteTeamDialogOpen}
				onOpenChange={setDeleteTeamDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa đội {teamToDelete?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này sẽ xóa vĩnh viễn đội{" "}
							<strong>{teamToDelete?.name}</strong> và toàn bộ các vận động viên
							thuộc đội này khỏi giải đấu. Các trận đấu đã xếp lịch liên quan sẽ
							bị ảnh hưởng.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletingTeam}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTeam}
							disabled={deletingTeam}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deletingTeam ? "Đang xóa..." : "Xác nhận xóa đội"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Dialog Thêm 1 VĐV */}
			<Dialog
				open={singlePlayerDialogOpen}
				onOpenChange={setSinglePlayerDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Thêm vận động viên</DialogTitle>
						<DialogDescription>
							Thêm VĐV vào đội <strong>{targetTeamForPlayer?.name}</strong>.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveSinglePlayer} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="singlePlayerName"
								className="text-xs font-medium text-foreground"
							>
								Họ và tên <span className="text-destructive">*</span>
							</label>
							<Input
								id="singlePlayerName"
								value={playerName}
								onChange={(e) => setPlayerName(e.target.value)}
								placeholder="Ví dụ: Nguyễn Tiến Minh"
								required
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<span className="block text-xs font-medium text-foreground">
								Giới tính (tùy chọn)
							</span>
							<div className="flex gap-2">
								<Button
									type="button"
									size="sm"
									variant={playerGender === "m" ? "default" : "outline"}
									onClick={() =>
										setPlayerGender(playerGender === "m" ? "" : "m")
									}
									className="h-8 text-xs flex-1"
								>
									Nam
								</Button>
								<Button
									type="button"
									size="sm"
									variant={playerGender === "f" ? "default" : "outline"}
									onClick={() =>
										setPlayerGender(playerGender === "f" ? "" : "f")
									}
									className="h-8 text-xs flex-1"
								>
									Nữ
								</Button>
							</div>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setSinglePlayerDialogOpen(false)}
								disabled={submittingPlayer}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={submittingPlayer}>
								{submittingPlayer ? "Đang thêm..." : "Thêm VĐV"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Dialog Thêm Nhanh Nhiều VĐV (Batch) */}
			<Dialog
				open={batchPlayerDialogOpen}
				onOpenChange={setBatchPlayerDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Thêm nhanh nhiều vận động viên</DialogTitle>
						<DialogDescription>
							Dán danh sách vận động viên vào ô bên dưới, mỗi người trên một
							dòng.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveBatchPlayers} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="batchTextarea"
								className="text-xs font-medium text-foreground"
							>
								Danh sách VĐV của đội {targetTeamForBatch?.name}
							</label>
							<Textarea
								id="batchTextarea"
								value={batchNamesText}
								onChange={(e) => setBatchNamesText(e.target.value)}
								placeholder={`Nguyễn Văn A\nTrần Văn B\nLê Thị C\nPhạm Văn D`}
								rows={7}
								required
								autoFocus
								className="font-sans text-xs leading-relaxed"
							/>
							<p className="text-[11px] text-muted-foreground">
								Các dòng trống sẽ tự động được bỏ qua.
							</p>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setBatchPlayerDialogOpen(false)}
								disabled={submittingBatch}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={submittingBatch}>
								{submittingBatch ? "Đang thêm..." : "Thêm tất cả VĐV"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xóa VĐV */}
			<AlertDialog
				open={deletePlayerDialogOpen}
				onOpenChange={setDeletePlayerDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa vận động viên?</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa vận động viên{" "}
							<strong>{playerToDelete?.full_name}</strong>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletingPlayer}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeletePlayer}
							disabled={deletingPlayer}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deletingPlayer ? "Đang xóa..." : "Xác nhận xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
