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

  const hasReachedMaxMatches = await checkMaxMatches(volunteer.id);

  const match = await createMatch(matchConfirmation, authToken);

  let volunteerStatus: string = ZENDESK_USER_UNAVAILABLE_STATUS;
  if (!hasReachedMaxMatches) {
    volunteerStatus = await fetchPreviousVolunteerStatus(volunteer.id);
  }

  await updateVolunteerStatus(volunteer, volunteerStatus);

  await confirmMatchConfirmation(
    matchConfirmation.matchConfirmationId,
    match.matchId
  );
}
