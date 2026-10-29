import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	CheckIcon,
	CopyIcon,
	ExternalLinkIcon,
	PlusIcon,
	Share2Icon,
	ShieldCheckIcon,
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
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { useTournamentAdmin } from "../$id";

interface RefereeWithToken {
	id: string;
	name: string;
	created_at: string;
	token: string | null;
}

export const Route = createFileRoute("/admin/tournaments/$id/referees")({
	component: RefereesManagementPage,
});

function RefereesManagementPage() {
	const { tournament } = useTournamentAdmin();

	// 1. Lấy danh sách trọng tài và token bí mật
	const {
		data: referees,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["admin", "referees", tournament.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("referees")
				.select(`
          id,
          name,
          created_at,
          referee_tokens (
            token
          )
        `)
				.eq("tournament_id", tournament.id)
				.order("created_at", { ascending: true });

			if (error) throw error;

			return (data || []).map((item) => {
				const rawTokens = item.referee_tokens;
				const token = Array.isArray(rawTokens)
					? (rawTokens[0]?.token ?? null)
					: ((rawTokens as { token: string } | null)?.token ?? null);

				return {
					id: item.id,
					name: item.name,
					created_at: item.created_at,
					token,
				} as RefereeWithToken;
			});
		},
	});

	// State dialog thêm trọng tài
	const [addDialogOpen, setAddDialogOpen] = React.useState(false);
	const [refereeName, setRefereeName] = React.useState("");
	const [addingReferee, setAddingReferee] = React.useState(false);

	// State dialog xóa trọng tài
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [refereeToDelete, setRefereeToDelete] =
		React.useState<RefereeWithToken | null>(null);
	const [deletingReferee, setDeletingReferee] = React.useState(false);

	const handleAddReferee = async (e: React.FormEvent) => {
		e.preventDefault();
		const name = refereeName.trim();
		if (!name) {
			showRpcError("Vui lòng nhập họ tên trọng tài.");
			return;
		}

		setAddingReferee(true);
		try {
			// Trigger database tự động tạo 24 byte base64url token vào referee_tokens
			const { error } = await supabase.from("referees").insert({
				tournament_id: tournament.id,
				name,
			});

			if (error) throw error;
			toastSuccess(
				`Đã thêm trọng tài ${name} và tạo đường dẫn chấm điểm bí mật!`,
			);
			setAddDialogOpen(false);
			setRefereeName("");
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setAddingReferee(false);
		}
	};

	const handleDeleteReferee = async () => {
		if (!refereeToDelete) return;
		setDeletingReferee(true);
		try {
			const { error } = await supabase
				.from("referees")
				.delete()
				.eq("id", refereeToDelete.id);

			if (error) throw error;
			toastSuccess(
				`Đã xóa trọng tài ${refereeToDelete.name}. Đường dẫn chấm điểm cũ đã bị vô hiệu hóa.`,
			);
			setDeleteDialogOpen(false);
			setRefereeToDelete(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeletingReferee(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div>
					<h2 className="font-heading text-lg font-bold text-foreground">
						Danh sách Trọng tài & Đường dẫn chấm điểm
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Trọng tài không cần tài khoản, chỉ cần mở đường dẫn bí mật để chấm
						điểm các trận được phân công.
					</p>
				</div>
				<Button
					onClick={() => setAddDialogOpen(true)}
					className="gap-1.5 self-start sm:self-auto text-xs"
				>
					<PlusIcon className="size-4" />
					<span>Thêm trọng tài mới</span>
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2].map((i) => (
						<Card key={i} className="p-4 space-y-3">
							<div className="h-5 w-36 bg-muted animate-pulse" />
							<div className="h-8 w-full bg-muted animate-pulse" />
						</Card>
					))}
				</div>
			) : !referees || referees.length === 0 ? (
				<Empty className="border border-dashed py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ShieldCheckIcon className="size-6 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>Chưa có trọng tài nào</EmptyTitle>
						<EmptyDescription>
							Hãy thêm trọng tài đầu tiên. Hệ thống sẽ tự động tạo một đường dẫn
							bí mật riêng để bạn gửi qua Zalo/Tin nhắn cho trọng tài.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							onClick={() => setAddDialogOpen(true)}
							className="gap-1.5 text-xs"
						>
							<PlusIcon className="size-4" />
							Thêm trọng tài đầu tiên
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{referees.map((ref) => (
						<RefereeLinkCard
							key={ref.id}
							referee={ref}
							tournamentName={tournament.name}
							onDelete={() => {
								setRefereeToDelete(ref);
								setDeleteDialogOpen(true);
							}}
						/>
					))}
				</div>
			)}

			{/* Dialog Thêm Trọng Tài */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Thêm trọng tài mới</DialogTitle>
						<DialogDescription>
							Chỉ cần nhập tên trọng tài. Hệ thống sẽ tự động sinh mã liên kết
							bí mật để gửi cho trọng tài chấm điểm trên điện thoại.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleAddReferee} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="refereeName"
								className="text-xs font-medium text-foreground"
							>
								Họ và tên trọng tài <span className="text-destructive">*</span>
							</label>
							<Input
								id="refereeName"
								value={refereeName}
								onChange={(e) => setRefereeName(e.target.value)}
								placeholder="Ví dụ: Nguyễn Văn Toàn, Bùi Tiến Dũng"
								required
								autoFocus
							/>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setAddDialogOpen(false)}
								disabled={addingReferee}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={addingReferee}>
								{addingReferee ? "Đang thêm..." : "Tạo trọng tài"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xóa Trọng Tài */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Xóa trọng tài {refereeToDelete?.name}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này sẽ xóa trọng tài và{" "}
							<strong>vô hiệu hóa vĩnh viễn</strong> liên kết chấm điểm bí mật
							của người này. Các trận đấu đã phân công cho trọng tài này sẽ
							chuyển về chưa có trọng tài.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletingReferee}>
							Hủy
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteReferee}
							disabled={deletingReferee}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deletingReferee ? "Đang xóa..." : "Xác nhận xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

/**
 * Component RefereeLinkCard theo đặc tả 02 §3.2
 */
function RefereeLinkCard({
	referee,
	tournamentName,
	onDelete,
}: {
	referee: RefereeWithToken;
	tournamentName: string;
	onDelete: () => void;
}) {
	const [copied, setCopied] = React.useState(false);

	const secretUrl = referee.token
		? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${referee.token}`
		: "";

	const handleCopy = async () => {
		if (!secretUrl) return;
		try {
			await navigator.clipboard.writeText(secretUrl);
			setCopied(true);
			toastSuccess(`Đã sao chép liên kết của trọng tài ${referee.name}`);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			showRpcError("Không thể sao chép liên kết vào bộ nhớ tạm.");
		}
	};

	const handleShare = async () => {
		if (!secretUrl) return;
		if (navigator.share) {
			try {
				await navigator.share({
					title: `Đường dẫn trọng tài: ${referee.name}`,
					text: `Link chấm điểm các trận đấu giải ${tournamentName} dành cho trọng tài ${referee.name}:`,
					url: secretUrl,
				});
			} catch (err: unknown) {
				if ((err as Error).name !== "AbortError") {
					handleCopy();
				}
			}
		} else {
			handleCopy();
		}
	};

	return (
		<Card className="flex flex-col justify-between hover:border-foreground/30 transition-colors">
			<CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
				<div className="flex items-center gap-2">
					<ShieldCheckIcon className="size-4 text-primary shrink-0" />
					<CardTitle className="text-sm font-semibold text-foreground truncate">
						{referee.name}
					</CardTitle>
				</div>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onDelete}
					className="text-muted-foreground hover:text-destructive"
					title="Xóa trọng tài"
				>
					<Trash2Icon className="size-3.5" />
				</Button>
			</CardHeader>

			<CardContent className="p-4 space-y-3">
				<div className="space-y-1">
					<span className="block text-[11px] font-medium text-muted-foreground">
						Đường dẫn chấm điểm bí mật (Dành riêng cho {referee.name}):
					</span>
					<div className="flex items-center gap-1.5">
						<input
							type="text"
							readOnly
							value={secretUrl}
							className="h-8 flex-1 border border-input bg-muted/50 px-2 text-xs font-mono select-all outline-none truncate"
						/>
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopy}
							className="h-8 px-2.5 gap-1 shrink-0 text-xs"
							title="Sao chép link"
						>
							{copied ? (
								<CheckIcon className="size-3.5 text-win" />
							) : (
								<CopyIcon className="size-3.5" />
							)}
							<span>{copied ? "Đã chép" : "Sao chép"}</span>
						</Button>
					</div>
				</div>

				<div className="flex items-center justify-between pt-1 border-t border-border text-xs">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleShare}
						className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
					>
						<Share2Icon className="size-3.5" />
						<span>Chia sẻ (Zalo / Tin nhắn)</span>
					</Button>

					{secretUrl && (
						<a
							href={secretUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
						>
							<span>Mở thử link</span>
							<ExternalLinkIcon className="size-3" />
						</a>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
