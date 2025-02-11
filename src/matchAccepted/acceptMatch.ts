import type {
  MatchConfirmations,
  SupportRequests,
  Volunteers,
} from "@prisma/client";
import {
  authenticateMatch,
  checkMaxMatches,
  confirmMatchConfirmation,
  createMatch,
  updateTicketWithConfirmation,
} from "./matchAcceptedLogic";
import {
  fetchPreviousVolunteerStatus,
  updateVolunteerStatusToPreviousValue,
} from "../matchDenied/matchDeniedLogic";

export default async function acceptMatch(
  matchConfirmation: Pick<
    MatchConfirmations,
    | "matchConfirmationId"
    | "supportRequestId"
    | "volunteerId"
    | "matchType"
    | "matchStage"
  >,
  supportRequest: Pick<SupportRequests, "zendeskTicketId">,
  volunteer: Pick<Volunteers, "id" | "firstName" | "zendeskUserId">
) {
  await updateTicketWithConfirmation(supportRequest.zendeskTicketId, volunteer);

  const authToken = await authenticateMatch();

  const match = await createMatch(matchConfirmation, authToken);

  const hasReachedMaxMatches = await checkMaxMatches(volunteer.id);

  if (!hasReachedMaxMatches) {
    const previousVolunteerStatus = await fetchPreviousVolunteerStatus(
      volunteer.id
    );
    await updateVolunteerStatusToPreviousValue(
      volunteer,
      previousVolunteerStatus
    );
  }

  await confirmMatchConfirmation(
    matchConfirmation.matchConfirmationId,
    match.matchId
  );
}
