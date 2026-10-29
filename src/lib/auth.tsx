import type { Session, User } from "@supabase/supabase-js";
import * as React from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signInWithOtp: (
		email: string,
		redirectTo?: string,
	) => Promise<{ error: Error | null }>;
	signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null);
	const [session, setSession] = React.useState<Session | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		// 1. Lấy phiên hiện tại khi ứng dụng khởi động
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => {
				setSession(session);
				setUser(session?.user ?? null);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});

		// 2. Lắng nghe thay đổi trạng thái đăng nhập
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signInWithOtp = React.useCallback(
		async (email: string, redirectTo?: string) => {
			const callbackUrl = redirectTo || `${window.location.origin}/login`;
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: callbackUrl,
				},
			});
			return { error: error ? new Error(error.message) : null };
		},
		[],
	);

	const signOut = React.useCallback(async () => {
		await supabase.auth.signOut();
		setUser(null);
		setSession(null);
	}, []);

	const value = React.useMemo(
		() => ({
			user,
			session,
			loading,
			signInWithOtp,
			signOut,
		}),
		[user, session, loading, signInWithOtp, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
