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
  updateVolunteerStatus,
} from "../matchDenied/matchDeniedLogic";
import { ZENDESK_USER_UNAVAILABLE_STATUS } from "../constants";

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

  let volunteerStatus: string = ZENDESK_USER_UNAVAILABLE_STATUS;
  if (!hasReachedMaxMatches) {
    console.log(
      `[handle-answer] Volunteer ${volunteer.id} has not reached max matches, fetching previous status`
    );
    volunteerStatus = await fetchPreviousVolunteerStatus(volunteer.id);
  }
  console.log(`[handle-answer] Updating volunteer ${volunteer.id} after match`);
  await updateVolunteerStatus(volunteer, volunteerStatus);

  console.log(
    `[handle-answer] Confirming match confirmation for match ${matchConfirmation.matchConfirmationId}`
  );
  await confirmMatchConfirmation(
    matchConfirmation.matchConfirmationId,
    match.matchId
  );
}
