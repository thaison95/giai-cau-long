import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CalendarIcon,
	MapPinIcon,
	ShieldCheckIcon,
	TrophyIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

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

	// Mẫu 5 rubber
	const [rubberTemplate, setRubberTemplate] = React.useState<RubberKind[]>([
		"singles",
		"doubles",
		"singles",
		"doubles",
		"singles",
	]);

	const [submitting, setSubmitting] = React.useState(false);
	const [slugError, setSlugError] = React.useState<string | null>(null);

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

				{/* Luật thi đấu */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<ShieldCheckIcon className="size-4 text-primary" />
							Luật thi đấu (Mặc định chuẩn BWF)
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
									Khi tỉ số hòa 29–29, bên chạm điểm 30 trước sẽ thắng ván.
								</p>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="gamesToWin"
									className="text-xs font-medium text-foreground"
								>
									Số ván thắng để thắng trận (mặc định 2/3)
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
									Số trận thắng để thắng tie (mặc định 3/5)
								</label>
								<Input
									id="rubbersToWinTie"
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
						</div>
					</CardContent>
				</Card>

				{/* Mẫu cấu trúc 5 rubber */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							Mẫu thứ tự 5 trận (Rubber Template)
						</CardTitle>
						<CardDescription className="text-xs">
							Mỗi trận đồng đội (tie) khi tạo sẽ tự động sinh sẵn 5 trận đơn/đôi
							theo mẫu này.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{(
								["slot-1", "slot-2", "slot-3", "slot-4", "slot-5"] as const
							).map((slotKey, idx) => {
								const kind = rubberTemplate[idx];
								return (
									<div
										key={slotKey}
										className="flex items-center justify-between p-2.5 border border-border bg-muted/30 text-xs"
									>
										<span className="font-medium text-foreground">
											Trận {idx + 1} (
											{idx === 0 || idx === 2 || idx === 4
												? "Trận lẻ"
												: "Trận chẵn"}
											)
										</span>
										<div className="flex items-center gap-2">
											<Button
												type="button"
												size="sm"
												variant={kind === "singles" ? "default" : "outline"}
												onClick={() => handleRubberChange(idx, "singles")}
												className="h-7 px-3 text-xs"
											>
												Đơn (Singles)
											</Button>
											<Button
												type="button"
												size="sm"
												variant={kind === "doubles" ? "default" : "outline"}
												onClick={() => handleRubberChange(idx, "doubles")}
												className="h-7 px-3 text-xs"
											>
												Đôi (Doubles)
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
