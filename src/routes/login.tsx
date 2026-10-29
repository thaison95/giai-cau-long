import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { ArrowRightIcon, CheckCircle2Icon, MailIcon } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import { showRpcError, toastSuccess } from "@/lib/rpc-errors";

interface LoginSearch {
	redirect?: string;
}

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => {
		return {
			redirect:
				typeof search.redirect === "string" ? search.redirect : undefined,
		};
	},
	component: LoginPage,
});

function LoginPage() {
	const { user, loading, signInWithOtp } = useAuth();
	const search = useSearch({ from: "/login" });
	const navigate = useNavigate();

	const [email, setEmail] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);
	const [sentEmail, setSentEmail] = React.useState<string | null>(null);

	const redirectPath = search.redirect || "/admin";

	// Nếu người dùng đã đăng nhập, tự động chuyển hướng đến trang mong muốn
	React.useEffect(() => {
		if (!loading && user) {
			navigate({ to: redirectPath });
		}
	}, [user, loading, navigate, redirectPath]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;

		setSubmitting(true);
		try {
			// Callback redirect back to current URL with redirect parameter intact
			const callbackUrl = window.location.href;
			const { error } = await signInWithOtp(trimmed, callbackUrl);

			if (error) {
				showRpcError(
					error,
					"Không thể gửi email đăng nhập. Vui lòng kiểm tra lại địa chỉ email.",
				);
			} else {
				setSentEmail(trimmed);
				toastSuccess("Đã gửi email đăng nhập thành công!");
			}
		} catch (err) {
			showRpcError(err);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading || user) {
		return (
			<main className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-12">
				<div className="text-center text-sm text-muted-foreground animate-pulse">
					Đang xác thực thông tin...
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
			<Card className="w-full shadow-sm">
				<CardHeader className="text-center pb-2">
					<CardTitle className="text-xl font-bold">
						Ban tổ chức đăng nhập
					</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						Đăng nhập nhanh không cần mật khẩu qua Magic link gửi tới hòm thư
						của bạn.
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-4">
					{sentEmail ? (
						<div className="space-y-4 text-center">
							<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
								<CheckCircle2Icon className="size-6" />
							</div>
							<div className="space-y-1">
								<h3 className="font-heading text-sm font-semibold">
									Kiểm tra email của bạn
								</h3>
								<p className="text-xs text-muted-foreground">
									Chúng tôi đã gửi đường dẫn đăng nhập đến địa chỉ:
								</p>
								<p className="font-mono text-xs font-medium text-foreground bg-muted py-1 px-2 rounded-sm inline-block">
									{sentEmail}
								</p>
							</div>
							<p className="text-xs text-muted-foreground">
								Hãy mở hộp thư đến (hoặc thư rác) và nhấn vào liên kết xác nhận
								để đăng nhập ngay vào hệ thống.
							</p>
							<div className="pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setSentEmail(null)}
									className="w-full text-xs"
								>
									Dùng địa chỉ email khác
								</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<label
									htmlFor="email"
									className="text-xs font-medium text-foreground"
								>
									Địa chỉ email
								</label>
								<div className="relative">
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="ban-to-chuc@example.com"
										required
										autoFocus
										disabled={submitting}
										className="pr-9"
									/>
									<MailIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								</div>
							</div>

							<Button
								type="submit"
								disabled={submitting || !email.trim()}
								className="w-full gap-2 text-xs"
							>
								{submitting ? "Đang gửi link..." : "Nhận Magic link đăng nhập"}
								{!submitting && <ArrowRightIcon className="size-3.5" />}
							</Button>
						</form>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
