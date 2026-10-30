import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertCircleIcon,
	ArrowLeftIcon,
	CheckIcon,
	ClockIcon,
	FlagIcon,
	MapPinIcon,
	RotateCcwIcon,
	ShieldCheckIcon,
	UserCheckIcon,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { useTournamentAdmin } from "../../$id";

type Tie = Database["public"]["Tables"]["ties"]["Row"];
type Rubber = Database["public"]["Tables"]["rubbers"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];
type Referee = Database["public"]["Tables"]["referees"]["Row"];
type RubberPlayer = Database["public"]["Tables"]["rubber_players"]["Row"];
type Side = Database["public"]["Enums"]["side"];

export const Route = createFileRoute("/admin/tournaments/$id/ties/$tieId")({
	component: AdminTieDetailPage,
});

function AdminTieDetailPage() {
	const { id, tieId } = Route.useParams();
	const { tournament } = useTournamentAdmin();

	// 1. Tải thông tin tie, rubbers, teams, players, referees, rubber_players
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin", "tie-detail", tieId],
		queryFn: async () => {
			const [
				tieRes,
				rubbersRes,
				teamsRes,
				playersRes,
				refereesRes,
				rubberPlayersRes,
			] = await Promise.all([
				supabase.from("ties").select("*").eq("id", tieId).single(),
				supabase
					.from("rubbers")
					.select("*")
					.eq("tie_id", tieId)
					.order("position", { ascending: true }),
				supabase.from("teams").select("*").eq("tournament_id", id),
				supabase.from("players").select("*").eq("tournament_id", id),
				supabase
					.from("referees")
					.select("*")
					.eq("tournament_id", id)
					.order("name", { ascending: true }),
				supabase.from("rubber_players").select("*").eq("tournament_id", id),
			]);

			if (tieRes.error) throw tieRes.error;
			if (rubbersRes.error) throw rubbersRes.error;
			if (teamsRes.error) throw teamsRes.error;
			if (playersRes.error) throw playersRes.error;
			if (refereesRes.error) throw refereesRes.error;
			if (rubberPlayersRes.error) throw rubberPlayersRes.error;

			return {
				tie: tieRes.data as Tie,
				rubbers: (rubbersRes.data || []) as Rubber[],
				teams: (teamsRes.data || []) as Team[],
				players: (playersRes.data || []) as Player[],
				referees: (refereesRes.data || []) as Referee[],
				rubberPlayers: (rubberPlayersRes.data || []) as RubberPlayer[],
			};
		},
	});

	const tie = data?.tie;
	const rubbers = data?.rubbers || [];
	const teams = data?.teams || [];
	const players = data?.players || [];
	const referees = data?.referees || [];
	const rubberPlayers = data?.rubberPlayers || [];

	const teamA = teams.find((t) => t.id === tie?.team_a_id);
	const teamB = teams.find((t) => t.id === tie?.team_b_id);

	const playersA = React.useMemo(() => {
		if (!teamA) return [];
		return players.filter((p) => p.team_id === teamA.id);
	}, [players, teamA]);

	const playersB = React.useMemo(() => {
		if (!teamB) return [];
		return players.filter((p) => p.team_id === teamB.id);
	}, [players, teamB]);

	// Gom rubber_players theo rubber_id
	const playersByRubber = React.useMemo(() => {
		const map = new Map<string, { a: string[]; b: string[] }>();
		for (const rp of rubberPlayers) {
			const entry = map.get(rp.rubber_id) || { a: [], b: [] };
			if (rp.side === "a") entry.a.push(rp.player_id);
			if (rp.side === "b") entry.b.push(rp.player_id);
			map.set(rp.rubber_id, entry);
		}
		return map;
	}, [rubberPlayers]);

	// Modal State: "Gán cho tất cả" (Assign referee to all rubbers)
	const [assignAllDialogOpen, setAssignAllDialogOpen] = React.useState(false);
	const [bulkRefereeId, setBulkRefereeId] = React.useState<string>("");
	const [submittingBulkRef, setSubmittingBulkRef] = React.useState(false);

	// Modal State: Xử thua (Walkover)
	const [walkoverDialogOpen, setWalkoverDialogOpen] = React.useState(false);
	const [walkoverRubber, setWalkoverRubber] = React.useState<Rubber | null>(
		null,
	);
	const [walkoverSide, setWalkoverSide] = React.useState<Side>("a");
	const [submittingWalkover, setSubmittingWalkover] = React.useState(false);

	// Cập nhật trọng tài cho 1 rubber
	const handleUpdateReferee = async (
		rubberId: string,
		refId: string | null,
	) => {
		try {
			const { error } = await supabase
				.from("rubbers")
				.update({ referee_id: refId })
				.eq("id", rubberId);

			if (error) throw error;
			toastSuccess("Đã cập nhật trọng tài cho trận đấu!");
			refetch();
		} catch (err) {
			showRpcError(err);
		}
	};

	// Gán 1 trọng tài cho toàn bộ các rubber của tie
	const handleAssignBulkReferee = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmittingBulkRef(true);
		try {
			const refId = bulkRefereeId || null;
			const rubberIds = rubbers.map((r) => r.id);

			const { error } = await supabase
				.from("rubbers")
				.update({ referee_id: refId })
				.in("id", rubberIds);

			if (error) throw error;
			toastSuccess(
				refId
					? "Đã gán trọng tài cho tất cả các trận trong tie này!"
					: "Đã hủy gán trọng tài cho tất cả các trận trong tie này.",
			);
			setAssignAllDialogOpen(false);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingBulkRef(false);
		}
	};

	// Cập nhật giờ và sân cho 1 rubber
	const handleUpdateScheduleCourt = async (
		rubberId: string,
		scheduledAt: string | null,
		court: string | null,
	) => {
		try {
			const { error } = await supabase
				.from("rubbers")
				.update({
					scheduled_at: scheduledAt
						? new Date(scheduledAt).toISOString()
						: null,
					court: court ? court.trim() : null,
				})
				.eq("id", rubberId);

			if (error) throw error;
			toastSuccess("Đã lưu thời gian và sân thi đấu!");
			refetch();
		} catch (err) {
			showRpcError(err);
		}
	};

	// Xử thua walkover (chỉ áp dụng cho rubber scheduled)
	const handleConfirmWalkover = async () => {
		if (!walkoverRubber) return;
		setSubmittingWalkover(true);
		try {
			const { error } = await supabase.rpc("end_rubber_walkover", {
				p_rubber_id: walkoverRubber.id,
				p_winner_side: walkoverSide,
			});

			if (error) throw error;
			toastSuccess("Đã xử thua trận đấu thành công!");
			setWalkoverDialogOpen(false);
			setWalkoverRubber(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmittingWalkover(false);
		}
	};

	// Mở lại rubber đã kết thúc (nếu bấm nhầm điểm ở thể thức 1 set 21đ)
	const [reopeningRubberId, setReopeningRubberId] = React.useState<
		string | null
	>(null);

	const handleReopenRubber = async (rubberId: string) => {
		setReopeningRubberId(rubberId);
		try {
			const { error } = await supabase.rpc("reopen_finished_rubber", {
				p_rubber_id: rubberId,
			});

			if (error) throw error;
			toastSuccess(
				"Đã mở lại trận đấu thành công. Điểm số đã lùi 1 điểm để tiếp tục thi đấu.",
			);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setReopeningRubberId(null);
		}
	};

	if (isLoading || !tie) {
		return (
			<div className="space-y-4">
				<div className="h-6 w-32 bg-muted animate-pulse" />
				<Card className="p-6 space-y-4">
					<div className="h-8 w-64 bg-muted animate-pulse" />
					<div className="h-24 w-full bg-muted animate-pulse" />
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Nút quay lại & Tiêu đề tie */}
			<div>
				<Button
					variant="ghost"
					size="sm"
					render={
						<Link
							to="/admin/tournaments/$id/ties"
							params={{ id: tournament.id }}
						/>
					}
					className="gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 -ml-2"
				>
					<ArrowLeftIcon className="size-3.5" />
					<span>Quay lại danh sách lịch đấu</span>
				</Button>

				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="font-mono text-xs text-muted-foreground">
								#{tie.round_order}
							</span>
							<h1 className="font-heading text-lg md:text-xl font-bold tracking-tight text-foreground">
								{tie.round_label}
							</h1>
							<StatusBadge status={tie.status} />
						</div>
						<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
							{tie.scheduled_at && (
								<div className="flex items-center gap-1">
									<ClockIcon className="size-3.5" />
									<span>{formatDateTime(tie.scheduled_at)}</span>
								</div>
							)}
							{tie.court && (
								<div className="flex items-center gap-1">
									<MapPinIcon className="size-3.5" />
									<span>{tie.court}</span>
								</div>
							)}
						</div>
					</div>

					{referees.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setBulkRefereeId(referees[0]?.id || "");
								setAssignAllDialogOpen(true);
							}}
							className="gap-1.5 text-xs self-start sm:self-auto"
						>
							<UserCheckIcon className="size-3.5" />
							<span>Gán trọng tài cho tất cả</span>
						</Button>
					)}
				</div>
			</div>

			{/* Banner tỉ số hai đội */}
			<Card className="bg-muted/30">
				<CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
					{/* Đội A */}
					<div className="flex-1 flex flex-col md:flex-row items-center gap-2">
						<span className="text-2xl leading-none">
							{teamA?.flag_emoji || "🏸"}
						</span>
						<div>
							<div className="font-heading text-base font-bold text-foreground">
								{teamA ? teamA.name : "Chờ xác định"}
							</div>
							<div className="text-[11px] font-mono text-muted-foreground">
								{teamA ? `[${teamA.short_name}]` : "Đội A"}
							</div>
						</div>
					</div>

					{/* Tỉ số tie */}
					<div className="flex flex-col items-center justify-center px-4">
						<div className="flex items-center gap-3 font-mono text-2xl md:text-3xl font-extrabold bg-background px-4 py-1.5 border border-border shadow-xs">
							<span
								className={
									tie.winner_team_id === tie.team_a_id
										? "text-win"
										: "text-foreground"
								}
							>
								{tie.rubbers_won_a}
							</span>
							<span className="text-muted-foreground text-lg">–</span>
							<span
								className={
									tie.winner_team_id === tie.team_b_id
										? "text-win"
										: "text-foreground"
								}
							>
								{tie.rubbers_won_b}
							</span>
						</div>
						<span className="text-[10px] text-muted-foreground mt-1">
							Thắng {tournament.rule_rubbers_to_win_tie} trận là thắng tie
						</span>
					</div>

					{/* Đội B */}
					<div className="flex-1 flex flex-col md:flex-row-reverse items-center gap-2 text-center md:text-right">
						<span className="text-2xl leading-none">
							{teamB?.flag_emoji || "🏸"}
						</span>
						<div>
							<div className="font-heading text-base font-bold text-foreground">
								{teamB ? teamB.name : "Chờ xác định"}
							</div>
							<div className="text-[11px] font-mono text-muted-foreground">
								{teamB ? `[${teamB.short_name}]` : "Đội B"}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Cảnh báo nếu chưa có đủ 2 đội */}
			{(!teamA || !teamB) && (
				<div className="p-3 bg-warning/10 border border-warning/30 text-xs text-warning flex items-center gap-2">
					<AlertCircleIcon className="size-4 shrink-0" />
					<span>
						Trận đấu chưa đủ hai đội tham gia. Vui lòng cập nhật đủ Đội A và Đội
						B trước khi xếp đội hình hoặc bắt đầu trận.
					</span>
				</div>
			)}

			{/* Danh sách Rubbers */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-heading text-sm font-semibold text-foreground">
						Danh sách các trận (Rubbers)
					</h3>
					<span className="text-xs text-muted-foreground">
						Mẫu giải:{" "}
						{tournament.rubber_template
							.map((r) =>
								r === "singles"
									? "Đơn"
									: r === "mixed_doubles"
										? "Đôi nam nữ"
										: "Đôi",
							)
							.join(" – ")}
					</span>
				</div>

				{rubbers.map((rubber) => {
					const currentLineup = playersByRubber.get(rubber.id) || {
						a: [],
						b: [],
					};

					return (
						<RubberAdminCard
							key={rubber.id}
							rubber={rubber}
							tournamentId={tournament.id}
							teamA={teamA}
							teamB={teamB}
							playersA={playersA}
							playersB={playersB}
							currentLineupA={currentLineup.a}
							currentLineupB={currentLineup.b}
							referees={referees}
							onUpdateReferee={(refId) => handleUpdateReferee(rubber.id, refId)}
							onUpdateScheduleCourt={(sched, court) =>
								handleUpdateScheduleCourt(rubber.id, sched, court)
							}
							onWalkover={() => {
								setWalkoverRubber(rubber);
								setWalkoverSide("a");
								setWalkoverDialogOpen(true);
							}}
							onReopen={() => handleReopenRubber(rubber.id)}
							isReopening={reopeningRubberId === rubber.id}
							onRefetch={refetch}
						/>
					);
				})}
			</div>

			{/* Dialog Gán Trọng Tài Cho Tất Cả */}
			<Dialog open={assignAllDialogOpen} onOpenChange={setAssignAllDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Gán trọng tài cho tất cả trận đấu</DialogTitle>
						<DialogDescription>
							Chọn trọng tài sẽ phụ trách toàn bộ 5 trận trong tie{" "}
							{tie.round_label}.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleAssignBulkReferee} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="bulkRefSelect"
								className="text-xs font-medium text-foreground"
							>
								Chọn trọng tài
							</label>
							<select
								id="bulkRefSelect"
								value={bulkRefereeId}
								onChange={(e) => setBulkRefereeId(e.target.value)}
								className="h-9 w-full border border-input bg-background px-2 text-xs"
							>
								<option value="">
									-- Hủy phân công (Không chọn trọng tài) --
								</option>
								{referees.map((ref) => (
									<option key={ref.id} value={ref.id}>
										{ref.name}
									</option>
								))}
							</select>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setAssignAllDialogOpen(false)}
								disabled={submittingBulkRef}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={submittingBulkRef}>
								{submittingBulkRef ? "Đang lưu..." : "Gán cho tất cả"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xử Thua Walkover */}
			<AlertDialog
				open={walkoverDialogOpen}
				onOpenChange={setWalkoverDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xử thua trận đấu (Walkover)?</AlertDialogTitle>
						<AlertDialogDescription>
							Áp dụng khi một đội bỏ cuộc trước khi trận đấu diễn ra. Vui lòng
							chọn bên chiến thắng được hưởng walkover:
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="py-2 space-y-2">
						<label className="flex items-center gap-2 p-2 border border-border cursor-pointer text-xs">
							<input
								type="radio"
								name="walkoverSide"
								value="a"
								checked={walkoverSide === "a"}
								onChange={() => setWalkoverSide("a")}
								className="size-4"
							/>
							<span className="font-semibold text-foreground">
								{teamA ? teamA.name : "Đội A"} thắng
							</span>
						</label>

						<label className="flex items-center gap-2 p-2 border border-border cursor-pointer text-xs">
							<input
								type="radio"
								name="walkoverSide"
								value="b"
								checked={walkoverSide === "b"}
								onChange={() => setWalkoverSide("b")}
								className="size-4"
							/>
							<span className="font-semibold text-foreground">
								{teamB ? teamB.name : "Đội B"} thắng
							</span>
						</label>
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={submittingWalkover}>
							Hủy
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmWalkover}
							disabled={submittingWalkover}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{submittingWalkover ? "Đang xử lý..." : "Xác nhận xử thua"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function RubberKindBadge({ kind }: { kind: Rubber["kind"] }) {
	if (kind === "mixed_doubles") {
		return (
			<Badge
				variant="outline"
				className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold"
			>
				Đôi nam nữ (Mixed)
			</Badge>
		);
	}
	if (kind === "doubles") {
		return (
			<Badge
				variant="outline"
				className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 text-[10px] font-semibold"
			>
				Đôi (Doubles)
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold"
		>
			Đơn (Singles)
		</Badge>
	);
}

/**
 * Thẻ hiển thị và chỉnh sửa 1 Rubber (Trận đơn/đôi)
 */
function RubberAdminCard({
	rubber,
	tournamentId,
	teamA,
	teamB,
	playersA,
	playersB,
	currentLineupA,
	currentLineupB,
	referees,
	onUpdateReferee,
	onUpdateScheduleCourt,
	onWalkover,
	onReopen,
	isReopening,
	onRefetch,
}: {
	rubber: Rubber;
	tournamentId: string;
	teamA?: Team;
	teamB?: Team;
	playersA: Player[];
	playersB: Player[];
	currentLineupA: string[];
	currentLineupB: string[];
	referees: Referee[];
	onUpdateReferee: (refId: string | null) => void;
	onUpdateScheduleCourt: (
		scheduledAt: string | null,
		court: string | null,
	) => void;
	onWalkover: () => void;
	onReopen: () => void;
	isReopening?: boolean;
	onRefetch: () => void;
}) {
	const [scheduledAt, setScheduledAt] = React.useState(
		rubber.scheduled_at
			? new Date(rubber.scheduled_at).toISOString().slice(0, 16)
			: "",
	);
	const [court, setCourt] = React.useState(rubber.court || "");
	const [savingSettings, setSavingSettings] = React.useState(false);

	const isSingles = rubber.kind === "singles";
	const expectedCount = isSingles ? 1 : 2;

	// State cục bộ chọn lineup
	const [selectedA, setSelectedA] = React.useState<string[]>(currentLineupA);
	const [selectedB, setSelectedB] = React.useState<string[]>(currentLineupB);
	const [savingLineup, setSavingLineup] = React.useState(false);

	React.useEffect(() => {
		setSelectedA(currentLineupA);
		setSelectedB(currentLineupB);
	}, [currentLineupA, currentLineupB]);

	const handleSaveLineup = async () => {
		if (!teamA || !teamB) {
			showRpcError("Tie chưa đủ hai đội để phân bổ đội hình.");
			return;
		}

		// Validate
		const aValid = selectedA.filter(Boolean);
		const bValid = selectedB.filter(Boolean);

		if (isSingles) {
			if (aValid.length === 0 || bValid.length === 0) {
				showRpcError("Trận đơn cần chọn đúng 1 vận động viên cho mỗi đội.");
				return;
			}
		} else {
			if (aValid.length !== 2 || bValid.length !== 2) {
				showRpcError("Trận đôi cần chọn đủ 2 vận động viên cho mỗi đội.");
				return;
			}
			if (aValid[0] === aValid[1]) {
				showRpcError("Đội A có hai vận động viên trùng nhau trong trận đôi.");
				return;
			}
			if (bValid[0] === bValid[1]) {
				showRpcError("Đội B có hai vận động viên trùng nhau trong trận đôi.");
				return;
			}
		}

		setSavingLineup(true);
		try {
			// 1. Xóa lineup cũ của rubber này
			const { error: delError } = await supabase
				.from("rubber_players")
				.delete()
				.eq("rubber_id", rubber.id);

			if (delError) throw delError;

			// 2. Chèn lineup mới
			const newRows = [
				...aValid.map((pid) => ({
					tournament_id: tournamentId,
					rubber_id: rubber.id,
					side: "a" as const,
					player_id: pid,
				})),
				...bValid.map((pid) => ({
					tournament_id: tournamentId,
					rubber_id: rubber.id,
					side: "b" as const,
					player_id: pid,
				})),
			];

			const { error: insError } = await supabase
				.from("rubber_players")
				.insert(newRows);
			if (insError) throw insError;

			toastSuccess(`Đã lưu đội hình Trận ${rubber.position}!`);
			onRefetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setSavingLineup(false);
		}
	};

	const handleSaveTimeCourt = async () => {
		setSavingSettings(true);
		try {
			await onUpdateScheduleCourt(scheduledAt || null, court || null);
		} finally {
			setSavingSettings(false);
		}
	};

	return (
		<Card className="overflow-hidden">
			{/* Header Rubber */}
			<CardHeader className="bg-muted/40 border-b border-border py-2.5 px-4 flex flex-row items-center justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="font-heading text-xs font-bold text-foreground">
						Trận {rubber.position}:
					</span>
					<RubberKindBadge kind={rubber.kind} />
					<RubberStatusBadge status={rubber.status} />
					{rubber.end_reason && rubber.end_reason !== "normal" && (
						<Badge variant="warning" className="text-[10px] h-4">
							{rubber.end_reason === "retired"
								? "Bỏ cuộc giữa trận"
								: "Xử thua (Walkover)"}
						</Badge>
					)}
				</div>

				{/* Điểm ván & Hành động */}
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="xs"
						render={
							<Link
								to="/admin/tournaments/$id/rubbers/$rubberId"
								params={{ id: tournamentId, rubberId: rubber.id }}
							/>
						}
						className="text-[11px] h-6"
					>
						{rubber.status === "live" ? "Chấm tiếp" : "Chấm điểm"}
					</Button>
					{rubber.status !== "scheduled" && (
						<span className="font-mono text-xs font-bold text-foreground bg-background px-2 py-0.5 border border-border">
							{rubber.games_won_a} – {rubber.games_won_b}
						</span>
					)}

					{rubber.status === "scheduled" && (
						<Button
							variant="outline"
							size="xs"
							onClick={onWalkover}
							className="text-[11px] h-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
							title="Xử thua trận đấu"
						>
							<FlagIcon className="size-3 mr-1" />
							Xử thua
						</Button>
					)}

					{rubber.status === "finished" && (
						<Button
							variant="outline"
							size="xs"
							onClick={onReopen}
							disabled={isReopening}
							className="text-[11px] h-6 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
							title="Mở lại trận đấu để chỉnh sửa điểm khi bấm nhầm điểm kết thúc (lùi 1 điểm để tiếp tục thi đấu)"
						>
							<RotateCcwIcon className="size-3 mr-1" />
							{isReopening ? "Đang mở lại..." : "Mở lại trận"}
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent className="p-4 space-y-4">
				{/* Component LineupPicker */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Phía Đội A */}
					<div className="space-y-2 p-3 bg-muted/20 border border-border">
						<div className="flex items-center justify-between text-xs">
							<span className="font-semibold text-foreground flex items-center gap-1.5">
								<span>{teamA?.flag_emoji || "🏸"}</span>
								<span>{teamA ? teamA.name : "Đội A"}</span>
							</span>
							<span className="text-[11px] text-muted-foreground font-mono">
								{selectedA.filter(Boolean).length}/{expectedCount} VĐV
							</span>
						</div>

						<div className="space-y-2">
							{(["slot-a-1", "slot-a-2"] as const)
								.slice(0, expectedCount)
								.map((slotKey, idx) => (
									<div key={slotKey} className="space-y-1">
										<label
											htmlFor={`player-a-${rubber.id}-${idx}`}
											className="text-[10px] text-muted-foreground block"
										>
											Vận động viên {expectedCount > 1 ? idx + 1 : ""}:
										</label>
										<select
											id={`player-a-${rubber.id}-${idx}`}
											disabled={rubber.status !== "scheduled" || !teamA}
											value={selectedA[idx] || ""}
											onChange={(e) => {
												const next = [...selectedA];
												next[idx] = e.target.value;
												setSelectedA(next);
											}}
											className="h-8 w-full border border-input bg-background px-2 text-xs"
										>
											<option value="">-- Chọn VĐV Đội A --</option>
											{playersA.map((p) => (
												<option key={p.id} value={p.id}>
													{p.full_name}{" "}
													{p.gender
														? `(${p.gender === "m" ? "Nam" : "Nữ"})`
														: ""}
												</option>
											))}
										</select>
									</div>
								))}
						</div>
					</div>

					{/* Phía Đội B */}
					<div className="space-y-2 p-3 bg-muted/20 border border-border">
						<div className="flex items-center justify-between text-xs">
							<span className="font-semibold text-foreground flex items-center gap-1.5">
								<span>{teamB?.flag_emoji || "🏸"}</span>
								<span>{teamB ? teamB.name : "Đội B"}</span>
							</span>
							<span className="text-[11px] text-muted-foreground font-mono">
								{selectedB.filter(Boolean).length}/{expectedCount} VĐV
							</span>
						</div>

						<div className="space-y-2">
							{(["slot-b-1", "slot-b-2"] as const)
								.slice(0, expectedCount)
								.map((slotKey, idx) => (
									<div key={slotKey} className="space-y-1">
										<label
											htmlFor={`player-b-${rubber.id}-${idx}`}
											className="text-[10px] text-muted-foreground block"
										>
											Vận động viên {expectedCount > 1 ? idx + 1 : ""}:
										</label>
										<select
											id={`player-b-${rubber.id}-${idx}`}
											disabled={rubber.status !== "scheduled" || !teamB}
											value={selectedB[idx] || ""}
											onChange={(e) => {
												const next = [...selectedB];
												next[idx] = e.target.value;
												setSelectedB(next);
											}}
											className="h-8 w-full border border-input bg-background px-2 text-xs"
										>
											<option value="">-- Chọn VĐV Đội B --</option>
											{playersB.map((p) => (
												<option key={p.id} value={p.id}>
													{p.full_name}{" "}
													{p.gender
														? `(${p.gender === "m" ? "Nam" : "Nữ"})`
														: ""}
												</option>
											))}
										</select>
									</div>
								))}
						</div>
					</div>
				</div>

				{/* Nút lưu đội hình nếu trận chưa đấu */}
				{rubber.status === "scheduled" && (
					<div className="flex justify-end">
						<Button
							type="button"
							size="sm"
							onClick={handleSaveLineup}
							disabled={savingLineup || !teamA || !teamB}
							className="text-xs h-7 gap-1"
						>
							<CheckIcon className="size-3" />
							<span>
								{savingLineup
									? "Đang lưu..."
									: `Lưu đội hình Trận ${rubber.position}`}
							</span>
						</Button>
					</div>
				)}

				{/* Thiết lập Trọng tài, Sân & Giờ */}
				<div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
					{/* Trọng tài phụ trách */}
					<div className="space-y-1">
						<label
							htmlFor={`ref-select-${rubber.id}`}
							className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"
						>
							<ShieldCheckIcon className="size-3 text-primary" />
							Trọng tài bắt trận:
						</label>
						<select
							id={`ref-select-${rubber.id}`}
							value={rubber.referee_id || ""}
							onChange={(e) => onUpdateReferee(e.target.value || null)}
							className="h-8 w-full border border-input bg-background px-2 text-xs"
						>
							<option value="">-- Chưa gán trọng tài --</option>
							{referees.map((ref) => (
								<option key={ref.id} value={ref.id}>
									{ref.name}
								</option>
							))}
						</select>
					</div>

					{/* Sân đấu */}
					<div className="space-y-1">
						<label
							htmlFor={`court-input-${rubber.id}`}
							className="text-[11px] font-medium text-muted-foreground block"
						>
							Sân thi đấu:
						</label>
						<Input
							id={`court-input-${rubber.id}`}
							value={court}
							onChange={(e) => setCourt(e.target.value)}
							placeholder="Ví dụ: Sân 1"
							className="h-8 text-xs"
						/>
					</div>

					{/* Thời gian & Nút lưu */}
					<div className="space-y-1 flex items-end gap-2">
						<div className="flex-1">
							<label
								htmlFor={`time-input-${rubber.id}`}
								className="text-[11px] font-medium text-muted-foreground block"
							>
								Giờ đấu:
							</label>
							<Input
								id={`time-input-${rubber.id}`}
								type="datetime-local"
								value={scheduledAt}
								onChange={(e) => setScheduledAt(e.target.value)}
								className="h-8 text-xs"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleSaveTimeCourt}
							disabled={savingSettings}
							className="h-8 text-xs shrink-0"
						>
							{savingSettings ? "Đang lưu..." : "Lưu sân/giờ"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function RubberStatusBadge({ status }: { status: Rubber["status"] }) {
	switch (status) {
		case "scheduled":
			return (
				<Badge variant="outline" className="text-[10px] h-4">
					Chưa đấu
				</Badge>
			);
		case "live":
			return (
				<Badge variant="live" className="text-[10px] h-4">
					Đang diễn ra
				</Badge>
			);
		case "finished":
			return (
				<Badge variant="secondary" className="text-[10px] h-4">
					Hoàn thành
				</Badge>
			);
		case "skipped":
			return (
				<Badge
					variant="ghost"
					className="text-[10px] h-4 line-through opacity-70"
				>
					Bỏ qua
				</Badge>
			);
		default:
			return null;
	}
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
