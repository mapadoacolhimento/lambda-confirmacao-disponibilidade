import type {
  MatchConfirmations,
  SupportRequests,
  Volunteers,
} from "@prisma/client";
import {
  addSupportRequestToQueue,
  denyMatchConfirmation,
  makeVolunteerAvailable,
  updateTicketWithDenial,
} from "./matchDeniedLogic";

export default async function denyMatch(
  matchConfirmation: Pick<
    MatchConfirmations,
    "matchConfirmationId" | "supportRequestId" | "volunteerId" | "msrId"
  >,
  supportRequest: Pick<
    SupportRequests,
    "supportRequestId" | "supportType" | "zendeskTicketId"
  >,
  volunteer: Pick<Volunteers, "id" | "firstName" | "zendeskUserId">
) {
  await updateTicketWithDenial(supportRequest.zendeskTicketId, volunteer);

  await denyMatchConfirmation(matchConfirmation.matchConfirmationId);

  await addSupportRequestToQueue(matchConfirmation.supportRequestId);

  await makeVolunteerAvailable(volunteer);
}
