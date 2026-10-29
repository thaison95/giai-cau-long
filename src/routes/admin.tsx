import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
	component: AdminRouteGuard,
});

function AdminRouteGuard() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	React.useEffect(() => {
		if (!loading && !user) {
			// Lưu lại URL hiện tại để sau khi đăng nhập xong thì quay lại đúng trang này
			const currentUrl = location.href;
			navigate({
				to: "/login",
				search: {
					redirect: currentUrl,
				},
			});
		}
	}, [user, loading, navigate, location.href]);

	if (loading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground animate-pulse">
					<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span>Đang kiểm tra quyền truy cập...</span>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <Outlet />;
}
