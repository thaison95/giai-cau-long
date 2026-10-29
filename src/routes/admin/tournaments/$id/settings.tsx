import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	ClockIcon,
	GlobeIcon,
	SaveIcon,
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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { useTournamentAdmin } from "../$id";

export const Route = createFileRoute("/admin/tournaments/$id/settings")({
	component: TournamentSettingsPage,
});

function TournamentSettingsPage() {
	const { tournament, refetch } = useTournamentAdmin();
	const navigate = useNavigate();

	// Form states
	const [name, setName] = React.useState(tournament.name);
	const [slug, setSlug] = React.useState(tournament.slug);
	const [venue, setVenue] = React.useState(tournament.venue || "");
	const [description, setDescription] = React.useState(
		tournament.description || "",
	);
	const [startDate, setStartDate] = React.useState(tournament.start_date || "");
	const [endDate, setEndDate] = React.useState(tournament.end_date || "");

	// Luật thi đấu
	const [pointsToWin, setPointsToWin] = React.useState(
		tournament.rule_points_to_win,
	);
	const [pointsCap, setPointsCap] = React.useState(tournament.rule_points_cap);
	const [gamesToWin, setGamesToWin] = React.useState(
		tournament.rule_games_to_win,
	);
	const [rubbersToWinTie, setRubbersToWinTie] = React.useState(
		tournament.rule_rubbers_to_win_tie,
	);
	const [tieWinPoints, setTieWinPoints] = React.useState(
		tournament.rule_tie_win_points,
	);
	const [playAllRubbers, setPlayAllRubbers] = React.useState(
		tournament.play_all_rubbers ?? false,
	);
	const [standingsPointsMode, setStandingsPointsMode] = React.useState<
		"tie_wins" | "rubbers_won"
	>(
		(tournament.standings_points_mode as "tie_wins" | "rubbers_won") ||
			"tie_wins",
	);

	React.useEffect(() => {
		setName(tournament.name);
		setSlug(tournament.slug);
		setVenue(tournament.venue || "");
		setDescription(tournament.description || "");
		setStartDate(tournament.start_date || "");
		setEndDate(tournament.end_date || "");
		setPointsToWin(tournament.rule_points_to_win);
		setPointsCap(tournament.rule_points_cap);
		setGamesToWin(tournament.rule_games_to_win);
		setRubbersToWinTie(tournament.rule_rubbers_to_win_tie);
		setTieWinPoints(tournament.rule_tie_win_points);
		setPlayAllRubbers(tournament.play_all_rubbers ?? false);
		setStandingsPointsMode(
			(tournament.standings_points_mode as "tie_wins" | "rubbers_won") ||
				"tie_wins",
		);
	}, [tournament]);

	const [savingInfo, setSavingInfo] = React.useState(false);

	// Dialog Công khai giải
	const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
	const [publishing, setPublishing] = React.useState(false);

	// Dialog Kết thúc giải
	const [finishDialogOpen, setFinishDialogOpen] = React.useState(false);
	const [finishing, setFinishing] = React.useState(false);

	// Dialog Xóa giải
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [deleting, setDeleting] = React.useState(false);

	// Lưu thông tin giải
	const handleSaveInfo = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		const trimmedSlug = slug.trim().toLowerCase();

		if (!trimmedName) {
			showRpcError("Vui lòng nhập tên giải đấu.");
			return;
		}

		if (!trimmedSlug || !/^[a-z0-9-]+$/.test(trimmedSlug)) {
			showRpcError(
				"Mã đường dẫn (slug) chỉ gồm chữ thường không dấu, số và dấu gạch ngang.",
			);
			return;
		}

		if (pointsCap < pointsToWin) {
			showRpcError(
				"Điểm chạm trần tối đa phải lớn hơn hoặc bằng điểm chiến thắng.",
			);
			return;
		}

		setSavingInfo(true);
		try {
			// Kiểm tra trùng slug nếu có đổi slug
			if (trimmedSlug !== tournament.slug) {
				const { count, error: countErr } = await supabase
					.from("tournaments")
					.select("id", { count: "exact", head: true })
					.eq("slug", trimmedSlug)
					.neq("id", tournament.id);

				if (countErr) throw countErr;
				if (count && count > 0) {
					showRpcError(
						"Đường dẫn (slug) này đã được sử dụng. Vui lòng chọn đường dẫn khác.",
					);
					setSavingInfo(false);
					return;
				}
			}

			const { error } = await supabase
				.from("tournaments")
				.update({
					name: trimmedName,
					slug: trimmedSlug,
					venue: venue.trim() || null,
					description: description.trim() || null,
					start_date: startDate || null,
					end_date: endDate || null,
					rule_points_to_win: pointsToWin,
					rule_points_cap: pointsCap,
					rule_games_to_win: gamesToWin,
					rule_rubbers_to_win_tie: rubbersToWinTie,
					rule_tie_win_points: tieWinPoints,
					play_all_rubbers: playAllRubbers,
					standings_points_mode: standingsPointsMode,
				})
				.eq("id", tournament.id);

			if (error) throw error;

			toastSuccess("Cập nhật thông tin giải đấu thành công!");
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSavingInfo(false);
		}
	};

	// Công khai giải (draft -> published)
	const handlePublishTournament = async () => {
		setPublishing(true);
		try {
			const { error } = await supabase
				.from("tournaments")
				.update({ status: "published" })
				.eq("id", tournament.id);

			if (error) throw error;

			toastSuccess(
				"Đã công khai giải đấu thành công! Khán giả giờ đã có thể xem trực tiếp.",
			);
			setPublishDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setPublishing(false);
		}
	};

	// Kết thúc giải qua RPC finish_tournament
	const handleFinishTournament = async () => {
		setFinishing(true);
		try {
			const { error } = await supabase.rpc("finish_tournament", {
				p_tournament_id: tournament.id,
			});

			if (error) throw error;

			toastSuccess(
				"Đã kết thúc giải đấu. Toàn bộ trọng tài và liên kết bí mật đã được thu hồi.",
			);
			setFinishDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setFinishing(false);
		}
	};

	// Xóa giải đấu
	const handleDeleteTournament = async () => {
		setDeleting(true);
		try {
			const { error } = await supabase
				.from("tournaments")
				.delete()
				.eq("id", tournament.id);
			if (error) throw error;

			toastSuccess(`Đã xóa giải đấu ${tournament.name}`);
			navigate({ to: "/admin" });
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div>
					<h2 className="font-heading text-lg font-bold text-foreground">
						Cài đặt giải đấu
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Chỉnh sửa thông tin cơ bản, luật thi đấu, công khai hoặc kết thúc
						giải.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant={
							tournament.status === "published"
								? "default"
								: tournament.status === "draft"
									? "secondary"
									: "outline"
						}
					>
						{tournament.status === "published"
							? "Đang công khai"
							: tournament.status === "draft"
								? "Bản nháp"
								: "Đã kết thúc"}
					</Badge>
				</div>
			</div>

			{/* Hành động trạng thái giải đấu */}
			<Card className="border-primary/20 bg-primary/5">
				<CardHeader>
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<GlobeIcon className="size-4 text-primary" />
						Trạng thái hoạt động của giải
					</CardTitle>
					<CardDescription className="text-xs">
						Quản lý việc hiển thị giải đấu tới khán giả và thời điểm đóng giải.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-background border border-border">
						<div>
							<div className="font-semibold text-xs text-foreground">
								Công khai giải đấu (Public)
							</div>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								Chuyển từ Bản nháp sang Công khai để người hâm mộ xem lịch và tỉ
								số trực tiếp.
							</p>
						</div>
						{tournament.status === "draft" ? (
							<Button
								size="sm"
								onClick={() => setPublishDialogOpen(true)}
								className="gap-1.5 text-xs shrink-0"
							>
								<CheckCircle2Icon className="size-3.5" />
								<span>Công khai giải</span>
							</Button>
						) : (
							<Badge variant="default" className="text-xs px-2.5 py-1 shrink-0">
								Đã công khai
							</Badge>
						)}
					</div>

					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-background border border-border">
						<div>
							<div className="font-semibold text-xs text-foreground">
								Kết thúc giải đấu (Finish Tournament)
							</div>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								Đánh dấu giải hoàn thành, khóa việc cập nhật điểm số và xóa toàn
								bộ trọng tài/token bí mật.
							</p>
						</div>
						{tournament.status !== "finished" ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setFinishDialogOpen(true)}
								className="gap-1.5 text-xs shrink-0 text-warning hover:bg-warning/10 hover:text-warning"
							>
								<ClockIcon className="size-3.5" />
								<span>Kết thúc giải</span>
							</Button>
						) : (
							<Badge variant="outline" className="text-xs px-2.5 py-1 shrink-0">
								Giải đã kết thúc
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Form Sửa Thông Tin Giải */}
			<form onSubmit={handleSaveInfo} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							Thông tin giải đấu
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<label
								htmlFor="settingsName"
								className="text-xs font-medium text-foreground"
							>
								Tên giải đấu <span className="text-destructive">*</span>
							</label>
							<Input
								id="settingsName"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="settingsSlug"
								className="text-xs font-medium text-foreground"
							>
								Đường dẫn công khai (slug){" "}
								<span className="text-destructive">*</span>
							</label>
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1.5 border border-input select-none">
									/t/
								</span>
								<Input
									id="settingsSlug"
									value={slug}
									onChange={(e) =>
										setSlug(
											e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
										)
									}
									required
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="settingsVenue"
								className="text-xs font-medium text-foreground"
							>
								Địa điểm tổ chức
							</label>
							<Input
								id="settingsVenue"
								value={venue}
								onChange={(e) => setVenue(e.target.value)}
								placeholder="Nhà thi đấu Cầu Giấy, Hà Nội"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label
									htmlFor="settingsStartDate"
									className="text-xs font-medium text-foreground"
								>
									Ngày bắt đầu
								</label>
								<Input
									id="settingsStartDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="settingsEndDate"
									className="text-xs font-medium text-foreground"
								>
									Ngày kết thúc
								</label>
								<Input
									id="settingsEndDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="settingsDescription"
								className="text-xs font-medium text-foreground"
							>
								Mô tả
							</label>
							<Textarea
								id="settingsDescription"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={3}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Luật thi đấu */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							Quy định tính điểm & Luật thi đấu
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label
									htmlFor="sPointsToWin"
									className="text-xs font-medium text-foreground"
								>
									Điểm thắng ván
								</label>
								<Input
									id="sPointsToWin"
									type="number"
									min={11}
									max={30}
									value={pointsToWin}
									onChange={(e) => setPointsToWin(Number(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="sPointsCap"
									className="text-xs font-medium text-foreground"
								>
									Điểm chạm trần (tối đa)
								</label>
								<Input
									id="sPointsCap"
									type="number"
									min={pointsToWin}
									max={50}
									value={pointsCap}
									onChange={(e) => setPointsCap(Number(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="sGamesToWin"
									className="text-xs font-medium text-foreground"
								>
									Số ván thắng để thắng trận
								</label>
								<Input
									id="sGamesToWin"
									type="number"
									min={1}
									max={5}
									value={gamesToWin}
									onChange={(e) => setGamesToWin(Number(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="sRubbersToWin"
									className="text-xs font-medium text-foreground"
								>
									Số trận thắng để thắng tie
								</label>
								<Input
									id="sRubbersToWin"
									type="number"
									min={1}
									max={5}
									value={rubbersToWinTie}
									onChange={(e) => setRubbersToWinTie(Number(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-1.5 sm:col-span-2">
								<label
									htmlFor="sTiePoints"
									className="text-xs font-medium text-foreground"
								>
									Điểm BXH khi thắng tie
								</label>
								<Input
									id="sTiePoints"
									type="number"
									min={1}
									max={10}
									value={tieWinPoints}
									onChange={(e) => setTieWinPoints(Number(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-1.5 sm:col-span-2 p-3 bg-muted/40 border border-border">
								<div className="flex items-center justify-between gap-3">
									<div>
										<label
											htmlFor="sPlayAllRubbers"
											className="text-xs font-medium text-foreground block cursor-pointer"
										>
											Đánh đủ tất cả các trận trong tie (Play all rubbers)
										</label>
										<p className="text-[11px] text-muted-foreground mt-0.5">
											Các trận trong tie vẫn tiếp tục diễn ra ngay cả khi một
											đội đã đủ số trận thắng quy định (thích hợp cho giải Doanh
											nghiệp hoặc tính điểm theo số trận thắng).
										</p>
									</div>
									<Switch
										id="sPlayAllRubbers"
										checked={playAllRubbers}
										onCheckedChange={setPlayAllRubbers}
									/>
								</div>
							</div>

							<div className="space-y-1.5 sm:col-span-2">
								<label
									htmlFor="sStandingsPointsMode"
									className="text-xs font-medium text-foreground"
								>
									Chế độ tính điểm trên Bảng xếp hạng (Standings Points Mode)
								</label>
								<select
									id="sStandingsPointsMode"
									value={standingsPointsMode}
									onChange={(e) =>
										setStandingsPointsMode(
											e.target.value as "tie_wins" | "rubbers_won",
										)
									}
									className="w-full h-8 px-2.5 text-xs bg-background border border-input text-foreground outline-none focus:border-ring"
								>
									<option value="tie_wins">
										Theo trận đồng đội thắng (tie_wins) — Mặc định BWF: Đội
										thắng tie nhận điểm quy định
									</option>
									<option value="rubbers_won">
										Theo tổng số trận con thắng (rubbers_won) — Giải Doanh
										nghiệp: Mỗi rubber thắng tính 1 điểm trên BXH
									</option>
								</select>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={savingInfo}
						className="gap-1.5 text-xs"
					>
						<SaveIcon className="size-3.5" />
						<span>{savingInfo ? "Đang lưu..." : "Lưu cài đặt giải đấu"}</span>
					</Button>
				</div>
			</form>

			{/* Khu vực nguy hiểm (Danger Zone) */}
			<Card className="border-destructive/30 bg-destructive/5">
				<CardHeader>
					<CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
						<AlertTriangleIcon className="size-4" />
						Khu vực nguy hiểm
					</CardTitle>
					<CardDescription className="text-xs">
						Các thao tác xóa giải đấu vĩnh viễn và không thể khôi phục lại.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-background border border-destructive/20">
						<div>
							<div className="font-semibold text-xs text-destructive">
								Xóa toàn bộ giải đấu này
							</div>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								Xóa toàn bộ các đội thi đấu, vận động viên, lịch đấu, tỉ số và
								ban tổ chức của giải.
							</p>
						</div>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setDeleteDialogOpen(true)}
							className="gap-1.5 text-xs shrink-0"
						>
							<Trash2Icon className="size-3.5" />
							<span>Xóa giải đấu</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* AlertDialog Công Khai Giải */}
			<AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Công khai giải đấu?</AlertDialogTitle>
						<AlertDialogDescription>
							Sau khi công khai, người hâm mộ và các đoàn tham gia có thể truy
							cập đường dẫn công khai để xem danh sách đội, lịch thi đấu và tỉ
							số trực tiếp.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={publishing}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handlePublishTournament}
							disabled={publishing}
						>
							{publishing ? "Đang xử lý..." : "Xác nhận công khai"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* AlertDialog Kết Thúc Giải */}
			<AlertDialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Bạn có chắc chắn muốn kết thúc giải?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Thao tác này sẽ đánh dấu giải đấu đã hoàn thành.{" "}
							<strong>Toàn bộ trọng tài sẽ bị xóa</strong> và{" "}
							<strong>
								các đường dẫn chấm điểm bí mật của họ sẽ bị vô hiệu hóa ngay lập
								tức
							</strong>
							. Bạn không thể hoàn tác thao tác này.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={finishing}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleFinishTournament}
							disabled={finishing}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{finishing ? "Đang kết thúc giải..." : "Xác nhận kết thúc giải"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* AlertDialog Xóa Giải */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Xóa vĩnh viễn giải đấu {tournament.name}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này <strong>không thể khôi phục</strong>. Toàn bộ cơ sở
							dữ liệu liên quan đến giải đấu này (đội, VĐV, trận đấu, điểm số)
							sẽ bị xóa hoàn toàn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTournament}
							disabled={deleting}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deleting ? "Đang xóa giải..." : "Xóa vĩnh viễn"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
