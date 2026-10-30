import { createFileRoute } from "@tanstack/react-router";
import { RubberScoringScreen } from "@/components/scoring/RubberScoringScreen";

export const Route = createFileRoute("/r/$token/rubbers/$rubberId")({
	component: RefereeRubberPage,
});

function RefereeRubberPage() {
	const { token, rubberId } = Route.useParams();
	return (
		<RubberScoringScreen rubberId={rubberId} token={token} backTo="referee" />
	);
}
