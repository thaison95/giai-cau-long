import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/r/$token")({ component: RefereeLayout });

function RefereeLayout() {
	return <Outlet />;
}
