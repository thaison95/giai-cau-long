import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	MailIcon,
	ShieldCheckIcon,
	Trash2Icon,
	UserPlusIcon,
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { useTournamentAdmin } from "../$id";

type Organizer = Database["public"]["Tables"]["tournament_organizers"]["Row"];

export const Route = createFileRoute("/admin/tournaments/$id/members")({
	component: MembersManagementPage,
});

function MembersManagementPage() {
	const { tournament } = useTournamentAdmin();
	const { user } = useAuth();

	// 1. Tải danh sách thành viên ban tổ chức
	const {
		data: members,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["admin", "tournament-organizers", tournament.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("tournament_organizers")
				.select("*")
				.eq("tournament_id", tournament.id)
				.order("created_at", { ascending: true });

			if (error) throw error;
			return (data || []) as Organizer[];
		},
	});

	// State Dialog Thêm thành viên
	const [addDialogOpen, setAddDialogOpen] = React.useState(false);
	const [emailToAdd, setEmailToAdd] = React.useState("");
	const [addingMember, setAddingMember] = React.useState(false);

	// State Dialog Xóa thành viên
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [memberToDelete, setMemberToDelete] = React.useState<Organizer | null>(
		null,
	);
	const [deletingMember, setDeletingMember] = React.useState(false);

	const handleAddMember = async (e: React.FormEvent) => {
		e.preventDefault();
		const email = emailToAdd.trim().toLowerCase();
		if (!email) {
			showRpcError("Vui lòng nhập địa chỉ email thành viên.");
			return;
		}

		setAddingMember(true);
		try {
			// Gọi RPC add_organizer_by_email
			const { error } = await supabase.rpc("add_organizer_by_email", {
				p_tournament_id: tournament.id,
				p_email: email,
			});

			if (error) throw error;

			toastSuccess(`Đã thêm thành viên ${email} vào ban tổ chức giải!`);
			setAddDialogOpen(false);
			setEmailToAdd("");
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setAddingMember(false);
		}
	};

	const handleDeleteMember = async () => {
		if (!memberToDelete) return;
		setDeletingMember(true);
		try {
			const { error } = await supabase
				.from("tournament_organizers")
				.delete()
				.eq("tournament_id", tournament.id)
				.eq("user_id", memberToDelete.user_id);

			if (error) throw error;

			toastSuccess(
				`Đã xóa ${memberToDelete.email || "thành viên"} khỏi ban tổ chức.`,
			);
			setDeleteDialogOpen(false);
			setMemberToDelete(null);
			refetch();
		} catch (err) {
			showRpcError(err);
		} finally {
			setDeletingMember(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
				<div>
					<h2 className="font-heading text-lg font-bold text-foreground">
						Thành viên Ban tổ chức
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Những người có quyền quản trị, thêm bớt đội, xếp lịch thi đấu và
						chấm điểm mọi trận trong giải.
					</p>
				</div>
				<Button
					onClick={() => setAddDialogOpen(true)}
					className="gap-1.5 self-start sm:self-auto text-xs"
				>
					<UserPlusIcon className="size-4" />
					<span>Thêm thành viên</span>
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<Card key={i} className="p-4 space-y-2">
							<div className="h-5 w-48 bg-muted animate-pulse" />
							<div className="h-4 w-32 bg-muted animate-pulse" />
						</Card>
					))}
				</div>
			) : (
				<div className="space-y-3">
					{(members || []).map((m) => {
						const isCurrentUser = m.user_id === user?.id;
						const isCreator = m.user_id === tournament.created_by;

						return (
							<Card
								key={m.user_id}
								className="p-4 flex items-center justify-between gap-4"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="p-2 bg-muted text-primary rounded-none shrink-0">
										<ShieldCheckIcon className="size-5" />
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-medium text-xs text-foreground truncate">
												{m.email || "Thành viên ban tổ chức"}
											</span>
											{isCurrentUser && (
												<Badge
													variant="default"
													className="text-[10px] h-4 px-1.5"
												>
													Bạn
												</Badge>
											)}
											{isCreator && (
												<Badge
													variant="secondary"
													className="text-[10px] h-4 px-1.5"
												>
													Người tạo giải
												</Badge>
											)}
										</div>
										<p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
											Tham gia: {formatDate(m.created_at)}
										</p>
									</div>
								</div>

								<div>
									<Button
										variant="ghost"
										size="icon-xs"
										disabled={(members || []).length <= 1}
										onClick={() => {
											setMemberToDelete(m);
											setDeleteDialogOpen(true);
										}}
										className="text-muted-foreground hover:text-destructive"
										title={
											(members || []).length <= 1
												? "Không thể xóa người quản trị cuối cùng"
												: "Xóa thành viên"
										}
									>
										<Trash2Icon className="size-3.5" />
									</Button>
								</div>
							</Card>
						);
					})}
				</div>
			)}

			{/* Dialog Thêm Thành Viên Bằng Email */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Thêm thành viên Ban tổ chức</DialogTitle>
						<DialogDescription>
							Nhập địa chỉ email của người bạn muốn phân quyền quản trị giải.
							Người này cần phải đã từng đăng nhập vào hệ thống trước đó.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleAddMember} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label
								htmlFor="memberEmail"
								className="text-xs font-medium text-foreground"
							>
								Địa chỉ email <span className="text-destructive">*</span>
							</label>
							<div className="relative">
								<Input
									id="memberEmail"
									type="email"
									value={emailToAdd}
									onChange={(e) => setEmailToAdd(e.target.value)}
									placeholder="dong-nghiep@example.com"
									required
									autoFocus
									className="pr-9 text-xs"
								/>
								<MailIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							</div>
						</div>

						<DialogFooter className="pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setAddDialogOpen(false)}
								disabled={addingMember}
							>
								Hủy
							</Button>
							<Button type="submit" size="sm" disabled={addingMember}>
								{addingMember ? "Đang thêm..." : "Thêm vào ban tổ chức"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* AlertDialog Xóa Thành Viên */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa quyền quản trị?</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa quyền quản lý giải đấu của{" "}
							<strong>{memberToDelete?.email}</strong>? Người này sẽ không thể
							xem hoặc chỉnh sửa giải đấu này nữa.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletingMember}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteMember}
							disabled={deletingMember}
							className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
						>
							{deletingMember ? "Đang xóa..." : "Xác nhận xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
