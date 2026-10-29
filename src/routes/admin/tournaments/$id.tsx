import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	ExternalLinkIcon,
	GridIcon,
	LayoutDashboardIcon,
	SettingsIcon,
	ShieldCheckIcon,
	TrophyIcon,
	UserPlusIcon,
	UsersIcon,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

export interface TournamentContextType {
	tournament: Tournament;
	refetch: () => Promise<unknown>;
}

export const TournamentAdminContext =
	React.createContext<TournamentContextType | null>(null);

export function useTournamentAdmin() {
	const context = React.useContext(TournamentAdminContext);
	if (!context) {
		throw new Error(
			"useTournamentAdmin must be used within a TournamentAdmin layout",
		);
	}
	return context;
}

export const Route = createFileRoute("/admin/tournaments/$id")({
	component: TournamentAdminLayout,
});

function TournamentAdminLayout() {
	const { id } = Route.useParams();
	const { user } = useAuth();
	const location = useLocation();

	// 1. Kiểm tra quyền organizer và lấy thông tin giải
	const {
		data: tournament,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["admin", "tournament", id, user?.id],
		queryFn: async () => {
			if (!user) return null;

			// Kiểm tra user có phải organizer của giải không
			const { data: org, error: orgError } = await supabase
				.from("tournament_organizers")
				.select("user_id")
				.eq("tournament_id", id)
				.eq("user_id", user.id)
				.maybeSingle();

			if (orgError) throw orgError;
			if (!org) return null; // Không phải organizer

			// Lấy thông tin giải
			const { data: tourney, error: tError } = await supabase
				.from("tournaments")
				.select("*")
				.eq("id", id)
				.single();

			if (tError) throw tError;
			return tourney as Tournament;
		},
		enabled: !!user && !!id,
	});

	if (isLoading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground animate-pulse">
					<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span>Đang tải thông tin giải đấu...</span>
				</div>
			</div>
		);
	}

	// Vào giải của organizer khác hoặc giải không tồn tại: hiển thị như không tìm thấy
	if (error || !tournament) {
		return (
			<main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
				<Empty className="border border-dashed py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<TrophyIcon className="size-6 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>Không tìm thấy giải đấu</EmptyTitle>
						<EmptyDescription>
							Giải đấu này không tồn tại hoặc bạn không có quyền quản lý giải
							đấu này.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button render={<Link to="/admin" />} className="text-xs">
							Về danh sách giải của tôi
						</Button>
					</EmptyContent>
				</Empty>
			</main>
		);
	}

	const navItems = [
		{
			title: "Tổng quan",
			href: `/admin/tournaments/${id}`,
			exact: true,
			icon: LayoutDashboardIcon,
		},
		{
			title: "Đội & VĐV",
			href: `/admin/tournaments/${id}/teams`,
			icon: UsersIcon,
		},
		{
			title: "Bảng đấu",
			href: `/admin/tournaments/${id}/groups`,
			icon: GridIcon,
		},
		{
			title: "Lịch đấu",
			href: `/admin/tournaments/${id}/ties`,
			icon: CalendarDaysIcon,
		},
		{
			title: "Trọng tài",
			href: `/admin/tournaments/${id}/referees`,
			icon: ShieldCheckIcon,
		},
		{
			title: "Thành viên",
			href: `/admin/tournaments/${id}/members`,
			icon: UserPlusIcon,
		},
		{
			title: "Cài đặt",
			href: `/admin/tournaments/${id}/settings`,
			icon: SettingsIcon,
		},
	];

	const isCurrentActive = (item: (typeof navItems)[0]) => {
		if (item.exact) {
			return location.pathname === item.href;
		}
		return location.pathname.startsWith(item.href);
	};

	return (
		<TournamentAdminContext.Provider value={{ tournament, refetch }}>
			<SidebarProvider defaultOpen={true}>
				<div className="flex min-h-[calc(100vh-4rem)] w-full">
					<Sidebar variant="inset" className="border-r border-border">
						<SidebarHeader className="border-b border-border p-3">
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon-xs"
									render={<Link to="/admin" />}
									title="Về danh sách giải"
								>
									<ArrowLeftIcon className="size-3.5" />
								</Button>
								<div className="flex-1 min-w-0">
									<h2
										className="font-heading text-xs font-bold truncate text-foreground"
										title={tournament.name}
									>
										{tournament.name}
									</h2>
									<div className="flex items-center gap-1.5 mt-0.5">
										<StatusBadge status={tournament.status} />
									</div>
								</div>
							</div>
						</SidebarHeader>

						<SidebarContent className="p-2">
							<SidebarGroup>
								<SidebarGroupContent>
									<SidebarMenu>
										{navItems.map((item) => {
											const Icon = item.icon;
											const active = isCurrentActive(item);
											return (
												<SidebarMenuItem key={item.href}>
													<SidebarMenuButton
														isActive={active}
														render={<Link to={item.href} />}
														className="text-xs"
													>
														<Icon className="size-4" />
														<span>{item.title}</span>
													</SidebarMenuButton>
												</SidebarMenuItem>
											);
										})}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						</SidebarContent>

						<SidebarFooter className="border-t border-border p-3">
							{tournament.status !== "draft" ? (
								<Button
									variant="outline"
									size="sm"
									className="w-full justify-between text-xs h-8"
									render={
										<a
											href={`/t/${tournament.slug}`}
											target="_blank"
											rel="noreferrer"
										>
											<span>Xem trang công khai</span>
											<ExternalLinkIcon className="size-3.5" />
										</a>
									}
								/>
							) : (
								<div className="text-[11px] text-muted-foreground text-center">
									Giải đang ở trạng thái bản nháp
								</div>
							)}
						</SidebarFooter>
					</Sidebar>

					<SidebarInset className="bg-background">
						{/* Header thanh điều hướng phía trên của trang admin */}
						<div className="flex h-12 items-center gap-3 border-b border-border px-4 md:px-6">
							<SidebarTrigger />
							<div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
								<Link to="/admin" className="hover:text-foreground">
									Giải đấu
								</Link>
								<span>/</span>
								<span className="font-medium text-foreground truncate max-w-[200px] md:max-w-md">
									{tournament.name}
								</span>
							</div>
						</div>

						{/* Nội dung trang con */}
						<div className="p-4 md:p-6 max-w-5xl">
							<Outlet />
						</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</TournamentAdminContext.Provider>
	);
}

function StatusBadge({ status }: { status: Tournament["status"] }) {
	switch (status) {
		case "draft":
			return (
				<Badge variant="secondary" className="text-[10px] h-4">
					Bản nháp
				</Badge>
			);
		case "published":
			return (
				<Badge variant="default" className="text-[10px] h-4">
					Công khai
				</Badge>
			);
		case "finished":
			return (
				<Badge variant="outline" className="text-[10px] h-4">
					Đã kết thúc
				</Badge>
			);
		default:
			return null;
	}
}
