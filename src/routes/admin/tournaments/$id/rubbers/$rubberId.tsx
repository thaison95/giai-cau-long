import { createFileRoute } from "@tanstack/react-router";
import { RubberScoringScreen } from "@/components/scoring/RubberScoringScreen";

export const Route = createFileRoute(
	"/admin/tournaments/$id/rubbers/$rubberId",
)({
	component: OrganizerRubberPage,
});

function OrganizerRubberPage() {
	const { rubberId } = Route.useParams();
	return <RubberScoringScreen rubberId={rubberId} backTo="admin" />;
}
