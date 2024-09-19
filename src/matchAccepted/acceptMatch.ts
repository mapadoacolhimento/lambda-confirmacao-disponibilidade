import type {
  MatchConfirmations,
  SupportRequests,
  Volunteers,
} from "@prisma/client";
import {
  authenticateMatch,
  confirmMatchConfirmation,
  createMatch,
  updateTicketWithConfirmation,
} from "./matchAcceptedLogic";
import { makeVolunteerAvailable } from "../matchDenied/matchDeniedLogic";

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
  await makeVolunteerAvailable(volunteer);

  await updateTicketWithConfirmation(supportRequest.zendeskTicketId, volunteer);

  const authToken = await authenticateMatch();

  const match = await createMatch(matchConfirmation, authToken);

  await confirmMatchConfirmation(
    matchConfirmation.matchConfirmationId,
    match.matchId
  );
}
