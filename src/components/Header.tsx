import { Link, useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
		navigate({ to: "/" });
	};

	return (
		<header className="border-b border-border bg-background">
			<nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3 md:px-6">
				<Link
					to="/"
					className="font-heading text-sm font-bold tracking-tight text-foreground no-underline hover:text-primary transition-colors"
				>
					GIẢI CẦU LÔNG
				</Link>
				<div className="ml-auto flex items-center gap-3 text-sm">
					<Link
						to="/admin"
						className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs md:text-sm"
					>
						Ban tổ chức
					</Link>

					{user && (
						<div className="flex items-center gap-2 border-l border-border pl-3">
							<span
								className="hidden sm:inline-block max-w-[140px] truncate text-xs text-muted-foreground"
								title={user.email}
							>
								{user.email}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSignOut}
								className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
								title="Đăng xuất"
							>
								<LogOutIcon className="size-3.5" />
								<span className="hidden md:inline">Đăng xuất</span>
							</Button>
						</div>
					)}

					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
