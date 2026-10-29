import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeftIcon, TrophyIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type Tournament,
	usePublicTournament,
} from "@/hooks/use-public-queries";

export interface TournamentPublicContextType {
	tournament: Tournament;
	refetch: () => Promise<unknown>;
}

export const TournamentPublicContext =
	React.createContext<TournamentPublicContextType | null>(null);

export function useTournamentPublic() {
	const context = React.useContext(TournamentPublicContext);
	if (!context) {
		throw new Error(
			"useTournamentPublic must be used within TournamentPublicLayout",
		);
	}
	return context;
}

export const Route = createFileRoute("/t/$slug")({
	component: TournamentPublicLayout,
});

function TournamentPublicLayout() {
	const { slug } = Route.useParams();
	const {
		data: tournament,
		isLoading,
		error,
		refetch,
	} = usePublicTournament(slug);

	if (isLoading) {
		return (
			<main className="mx-auto min-h-[75vh] max-w-5xl px-4 py-8 md:px-6">
				<div className="mb-6 space-y-3 border-b border-border/80 pb-6">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-8 w-2/3" />
					<div className="flex gap-3">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-5 w-32" />
					</div>
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			</main>
		);
	}

	// Nếu không tìm thấy hoặc giải ở trạng thái 'draft', hiển thị 404 thân thiện
	// Không để lộ giải draft có tồn tại
	if (error || !tournament) {
		return (
			<main className="mx-auto grid min-h-[70vh] max-w-5xl place-content-center px-4 text-center">
				<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none bg-muted text-muted-foreground">
					<TrophyIcon className="size-6" />
				</div>
				<h1 className="font-heading text-2xl font-bold text-foreground">
					Không tìm thấy giải đấu
				</h1>
				<p className="mt-2 text-sm text-muted-foreground max-w-md">
					Giải đấu này không tồn tại hoặc chưa được công khai.
				</p>
				<div className="mt-6 flex justify-center">
					<Button
						render={<Link to="/" />}
						variant="outline"
						size="sm"
						className="gap-1.5 text-xs"
					>
						<ArrowLeftIcon className="size-3.5" />
						<span>Về trang chủ</span>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<TournamentPublicContext.Provider
			value={{
				tournament,
				refetch: async () => {
					await refetch();
				},
			}}
		>
			<Outlet />
		</TournamentPublicContext.Provider>
	);
}
