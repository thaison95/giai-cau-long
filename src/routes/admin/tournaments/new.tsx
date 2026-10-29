import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CalendarIcon,
	MapPinIcon,
	ShieldCheckIcon,
	SparklesIcon,
	TrophyIcon,
} from "lucide-react";
import * as React from "react";
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
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { cn, slugify } from "@/lib/utils";

type RubberKind = Database["public"]["Enums"]["rubber_kind"];

export const Route = createFileRoute("/admin/tournaments/new")({
	component: NewTournamentPage,
});

function NewTournamentPage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	// Form states
	const [name, setName] = React.useState("");
	const [slug, setSlug] = React.useState("");
	const [isSlugManual, setIsSlugManual] = React.useState(false);
	const [venue, setVenue] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [startDate, setStartDate] = React.useState("");
	const [endDate, setEndDate] = React.useState("");

	// Luật thi đấu
	const [pointsToWin, setPointsToWin] = React.useState(21);
	const [pointsCap, setPointsCap] = React.useState(30);
	const [gamesToWin, setGamesToWin] = React.useState(2);
	const [rubbersToWinTie, setRubbersToWinTie] = React.useState(3);
	const [tieWinPoints, setTieWinPoints] = React.useState(1);
	const [playAllRubbers, setPlayAllRubbers] = React.useState(false);
	const [standingsPointsMode, setStandingsPointsMode] = React.useState<
		"tie_wins" | "rubbers_won"
	>("tie_wins");

	// Mẫu rubber động (1-7 trận)
	const [rubberTemplate, setRubberTemplate] = React.useState<RubberKind[]>([
		"singles",
		"doubles",
		"singles",
		"doubles",
		"singles",
	]);

	const [submitting, setSubmitting] = React.useState(false);
	const [slugError, setSlugError] = React.useState<string | null>(null);

	// Áp dụng Preset
	const applyPresetThomasUber = () => {
		setRubberTemplate(["singles", "doubles", "singles", "doubles", "singles"]);
		setGamesToWin(2);
		setPointsToWin(21);
		setPointsCap(30);
		setRubbersToWinTie(3);
		setTieWinPoints(1);
		setPlayAllRubbers(false);
		setStandingsPointsMode("tie_wins");
		toastSuccess("Đã áp dụng mẫu Thomas/Uber Cup (Chuẩn BWF)");
	};

	const applyPresetCorporate = () => {
		setRubberTemplate(["doubles", "doubles", "mixed_doubles"]);
		setGamesToWin(1);
		setPointsToWin(21);
		setPointsCap(30);
		setRubbersToWinTie(2);
		setTieWinPoints(1);
		setPlayAllRubbers(true);
		setStandingsPointsMode("rubbers_won");
		toastSuccess("Đã áp dụng mẫu Giải Doanh nghiệp (Trusting Social)");
	};

	const handleSetRubberCount = (targetCount: number) => {
		if (targetCount < 1 || targetCount > 7) return;
		if (targetCount === rubberTemplate.length) return;
		if (targetCount > rubberTemplate.length) {
			const added: RubberKind[] = Array(
				targetCount - rubberTemplate.length,
			).fill("doubles");
			setRubberTemplate([...rubberTemplate, ...added]);
		} else {
			setRubberTemplate(rubberTemplate.slice(0, targetCount));
		}
	};

	// Tự động gợi ý slug khi người dùng nhập tên nếu chưa chỉnh sửa thủ công
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		if (!isSlugManual) {
			setSlug(slugify(newName));
			setSlugError(null);
		}
	};

	const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsSlugManual(true);
		const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
		setSlug(val);
		setSlugError(null);
	};

	const handleRubberChange = (index: number, kind: RubberKind) => {
		const next = [...rubberTemplate];
		next[index] = kind;
		setRubberTemplate(next);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		const trimmedName = name.trim();
		const trimmedSlug = slug.trim();

		if (!trimmedName) {
			showRpcError("Vui lòng nhập tên giải đấu.");
			return;
		}

		if (!trimmedSlug) {
			setSlugError("Vui lòng nhập mã đường dẫn (slug).");
			return;
		}

		if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
			setSlugError(
				"Slug chỉ được chứa chữ thường không dấu, số và dấu gạch ngang.",
			);
			return;
		}

		if (pointsCap < pointsToWin) {
			showRpcError(
				"Điểm giới hạn (chạm trần) phải lớn hơn hoặc bằng điểm chiến thắng.",
			);
			return;
		}

		setSubmitting(true);
		try {
			// 1. Kiểm tra trùng slug
			const { count, error: countError } = await supabase
				.from("tournaments")
				.select("id", { count: "exact", head: true })
				.eq("slug", trimmedSlug);

			if (countError) throw countError;

			if (count && count > 0) {
				setSlugError(
					"Đường dẫn (slug) này đã được sử dụng. Vui lòng chọn đường dẫn khác.",
				);
				setSubmitting(false);
				return;
			}

			// 2. Tạo giải đấu (Trigger database sẽ tự thêm user vào tournament_organizers)
			const { data, error } = await supabase
				.from("tournaments")
				.insert({
					name: trimmedName,
					slug: trimmedSlug,
					venue: venue.trim() || null,
					description: description.trim() || null,
					start_date: startDate || null,
					end_date: endDate || null,
					created_by: user.id,
					rule_points_to_win: pointsToWin,
					rule_points_cap: pointsCap,
					rule_games_to_win: gamesToWin,
					rule_rubbers_to_win_tie: rubbersToWinTie,
					rule_tie_win_points: tieWinPoints,
					play_all_rubbers: playAllRubbers,
					standings_points_mode: standingsPointsMode,
					rubber_template: rubberTemplate,
					status: "draft",
				})
				.select("id")
				.single();

			if (error) throw error;

			toastSuccess("Đã tạo giải đấu thành công!");
			navigate({
				to: "/admin/tournaments/$id",
				params: { id: data.id },
			});
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
			<div className="mb-6">
				<Button
					variant="ghost"
					size="sm"
					render={<Link to="/admin" />}
					className="gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 -ml-2"
				>
					<ArrowLeftIcon className="size-3.5" />
					<span>Quay lại danh sách giải</span>
				</Button>
				<h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
					Tạo giải đấu mới
				</h1>
				<p className="text-xs text-muted-foreground mt-1">
					Thiết lập thông tin ban đầu, luật thi đấu và mẫu thứ tự các trận
					đơn/đôi cho giải.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Thông tin cơ bản */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<TrophyIcon className="size-4 text-primary" />
							Thông tin cơ bản
						</CardTitle>
						<CardDescription className="text-xs">
							Các thông tin hiển thị với người hâm mộ và các đoàn tham gia.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<label
								htmlFor="name"
								className="text-xs font-medium text-foreground"
							>
								Tên giải đấu <span className="text-destructive">*</span>
							</label>
							<Input
								id="name"
								value={name}
								onChange={handleNameChange}
								placeholder="Ví dụ: Giải Cầu Lông Đồng Đội Mùa Thu 2026"
								required
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="slug"
								className="text-xs font-medium text-foreground"
							>
								Mã đường dẫn công khai (slug){" "}
								<span className="text-destructive">*</span>
							</label>
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1.5 border border-input select-none">
									/t/
								</span>
								<Input
									id="slug"
									value={slug}
									onChange={handleSlugChange}
									placeholder="giai-cau-long-mua-thu-2026"
									required
									className={slugError ? "border-destructive" : ""}
								/>
							</div>
							{slugError ? (
								<p className="text-[11px] text-destructive">{slugError}</p>
							) : (
								<p className="text-[11px] text-muted-foreground">
									Chỉ gồm chữ thường không dấu, số và gạch ngang. Dùng để tạo
									link công khai xem tỉ số trực tiếp.
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="venue"
								className="text-xs font-medium text-foreground flex items-center gap-1.5"
							>
								<MapPinIcon className="size-3.5 text-muted-foreground" />
								Địa điểm tổ chức
							</label>
							<Input
								id="venue"
								value={venue}
								onChange={(e) => setVenue(e.target.value)}
								placeholder="Ví dụ: Nhà thi đấu Cầu Giấy, 35 Trần Quý Kiên, Hà Nội"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label
									htmlFor="startDate"
									className="text-xs font-medium text-foreground flex items-center gap-1.5"
								>
									<CalendarIcon className="size-3.5 text-muted-foreground" />
									Ngày bắt đầu
								</label>
								<Input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="endDate"
									className="text-xs font-medium text-foreground flex items-center gap-1.5"
								>
									<CalendarIcon className="size-3.5 text-muted-foreground" />
									Ngày kết thúc
								</label>
								<Input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="description"
								className="text-xs font-medium text-foreground"
							>
								Mô tả giải đấu
							</label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Giới thiệu thể thức, quy mô hoặc ghi chú dành cho các đội..."
								rows={3}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Cấu hình nhanh theo mẫu giải (Presets) */}
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
							<SparklesIcon className="size-4 text-primary" />
							Cấu hình nhanh theo thể thức giải (Presets)
						</CardTitle>
						<CardDescription className="text-xs">
							Chọn một trong các thể thức phổ biến để điền nhanh luật thi đấu và
							mẫu trận. Bạn hoàn toàn có thể tùy chỉnh chi tiết bên dưới.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<button
							type="button"
							onClick={applyPresetThomasUber}
							className="text-left cursor-pointer border border-border hover:border-primary bg-background p-3.5 space-y-2 transition-colors select-none rounded-none"
						>
							<div className="flex items-center justify-between">
								<span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
									🏆 Preset Thomas/Uber Cup
								</span>
								<Badge variant="outline" className="text-[10px]">
									Chuẩn BWF
								</Badge>
							</div>
							<p className="text-[11px] text-muted-foreground leading-relaxed">
								5 trận (Đơn, Đôi, Đơn, Đôi, Đơn). 2/3 ván 21đ (trần 30). Đội
								thắng 3 trận thắng tie (dừng khi đủ điểm). Điểm BXH tính theo
								trận thắng.
							</p>
						</button>

						<button
							type="button"
							onClick={applyPresetCorporate}
							className="text-left cursor-pointer border border-border hover:border-emerald-500 bg-background p-3.5 space-y-2 transition-colors select-none rounded-none"
						>
							<div className="flex items-center justify-between">
								<span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
									🏢 Preset Doanh nghiệp (Trusting Social)
								</span>
								<Badge
									variant="outline"
									className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
								>
									CLB Doanh nghiệp
								</Badge>
							</div>
							<p className="text-[11px] text-muted-foreground leading-relaxed">
								3 trận đôi (2 Đôi nam/tự do + 1 Đôi nam nữ). 1 ván 21đ duy nhất
								(trần 30). Đánh đủ 3 trận (play all). Điểm BXH tính theo tổng số
								rubber thắng.
							</p>
						</button>
					</CardContent>
				</Card>

				{/* Luật thi đấu */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<ShieldCheckIcon className="size-4 text-primary" />
							Luật thi đấu & Tính điểm
						</CardTitle>
						<CardDescription className="text-xs">
							Các thông số tính điểm cho từng ván (game) và trận đồng đội (tie).
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label
									htmlFor="pointsToWin"
									className="text-xs font-medium text-foreground"
								>
									Điểm thắng ván (mặc định 21)
								</label>
								<Input
									id="pointsToWin"
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
									htmlFor="pointsCap"
									className="text-xs font-medium text-foreground"
								>
									Điểm chạm trần tối đa (mặc định 30)
								</label>
								<Input
									id="pointsCap"
									type="number"
									min={pointsToWin}
									max={50}
									value={pointsCap}
									onChange={(e) => setPointsCap(Number(e.target.value))}
									required
								/>
								<p className="text-[11px] text-muted-foreground">
									Khi tỉ số hòa 29–29 (hoặc chạm trần), bên chạm điểm tối đa
									trước sẽ thắng ván.
								</p>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="gamesToWin"
									className="text-xs font-medium text-foreground"
								>
									Số ván thắng để thắng trận (1 hoặc 2/3)
								</label>
								<Input
									id="gamesToWin"
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
									htmlFor="rubbersToWinTie"
									className="text-xs font-medium text-foreground"
								>
									Số trận thắng quy định (mặc định 3/5 hoặc 2/3)
								</label>
								<Input
									id="rubbersToWinTie"
									type="number"
									min={1}
									max={7}
									value={rubbersToWinTie}
									onChange={(e) => setRubbersToWinTie(Number(e.target.value))}
									required
								/>
							</div>

							<div className="space-y-1.5 sm:col-span-2">
								<label
									htmlFor="tieWinPoints"
									className="text-xs font-medium text-foreground"
								>
									Điểm cộng BXH khi thắng tie (mặc định 1)
								</label>
								<Input
									id="tieWinPoints"
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
											htmlFor="playAllRubbers"
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
										id="playAllRubbers"
										checked={playAllRubbers}
										onCheckedChange={setPlayAllRubbers}
									/>
								</div>
							</div>

							<div className="space-y-1.5 sm:col-span-2">
								<label
									htmlFor="standingsPointsMode"
									className="text-xs font-medium text-foreground"
								>
									Chế độ tính điểm trên Bảng xếp hạng (Standings Points Mode)
								</label>
								<select
									id="standingsPointsMode"
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

				{/* Mẫu cấu trúc Rubber Template */}
				<Card>
					<CardHeader>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div>
								<CardTitle className="text-sm font-semibold">
									Mẫu thứ tự các trận (Rubber Template)
								</CardTitle>
								<CardDescription className="text-xs">
									Mỗi trận đồng đội (tie) khi tạo sẽ tự động sinh các trận đấu
									theo mẫu này.
								</CardDescription>
							</div>
							<div className="flex items-center gap-1 self-start sm:self-auto">
								<span className="text-xs font-medium text-muted-foreground mr-1">
									Số trận:
								</span>
								{[1, 2, 3, 4, 5, 6, 7].map((num) => (
									<Button
										key={num}
										type="button"
										size="sm"
										variant={
											rubberTemplate.length === num ? "default" : "outline"
										}
										onClick={() => handleSetRubberCount(num)}
										className="h-7 w-7 p-0 text-xs font-mono"
									>
										{num}
									</Button>
								))}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-2.5">
							{rubberTemplate.map((kind, idx) => {
								return (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: template slot order
										key={`slot-${idx}`}
										className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 border border-border bg-muted/30 text-xs gap-2"
									>
										<span className="font-medium text-foreground">
											Trận {idx + 1}
										</span>
										<div className="flex items-center gap-1.5 flex-wrap">
											<Button
												type="button"
												size="sm"
												variant={kind === "singles" ? "default" : "outline"}
												onClick={() => handleRubberChange(idx, "singles")}
												className="h-7 px-2.5 text-xs"
											>
												Đơn (Singles)
											</Button>
											<Button
												type="button"
												size="sm"
												variant={kind === "doubles" ? "default" : "outline"}
												onClick={() => handleRubberChange(idx, "doubles")}
												className="h-7 px-2.5 text-xs"
											>
												Đôi nam / tự do
											</Button>
											<Button
												type="button"
												size="sm"
												variant={
													kind === "mixed_doubles" ? "default" : "outline"
												}
												onClick={() => handleRubberChange(idx, "mixed_doubles")}
												className={cn(
													"h-7 px-2.5 text-xs",
													kind === "mixed_doubles"
														? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
														: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10",
												)}
											>
												Đôi nam nữ (Mixed)
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center justify-end gap-3 pt-4">
					<Button
						type="button"
						variant="outline"
						render={<Link to="/admin" />}
						disabled={submitting}
					>
						Hủy bỏ
					</Button>
					<Button type="submit" disabled={submitting}>
						{submitting ? "Đang tạo giải đấu..." : "Hoàn tất & Tạo giải đấu"}
					</Button>
				</div>
			</form>
		</main>
	);
}
