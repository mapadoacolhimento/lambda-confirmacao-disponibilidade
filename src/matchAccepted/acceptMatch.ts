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
  console.log(
    `[handle-answer] Volunteer ${volunteer.id} accepted match for support request ${supportRequest.zendeskTicketId}`
  );
  await updateTicketWithConfirmation(supportRequest.zendeskTicketId, volunteer);

  const authToken = await authenticateMatch();

  const match = await createMatch(matchConfirmation, authToken);

  const hasReachedMaxMatches = await checkMaxMatches(volunteer.id);
  console.log(
    `[handle-answer][acceptMatch] Volunteer ${volunteer.id} has reached max matches: ${hasReachedMaxMatches}`
  );
  if (!hasReachedMaxMatches) {
    console.log(
      `[handle-answer] Updating volunteer ${volunteer.id} after match`
    );
    const previousVolunteerStatus = await fetchPreviousVolunteerStatus(
      volunteer.id
    );
    await updateVolunteerStatusToPreviousValue(
      volunteer,
      previousVolunteerStatus
    );
  }
  console.log(
    `[handle-answer] Confirming match confirmation for match ${matchConfirmation.matchConfirmationId}`
  );
  await confirmMatchConfirmation(
    matchConfirmation.matchConfirmationId,
    match.matchId
  );
}
