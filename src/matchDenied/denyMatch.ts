import type {
  MatchConfirmations,
  SupportRequests,
  Volunteers,
} from "@prisma/client";
import {
  addSupportRequestToQueue,
  denyMatchConfirmation,
  fetchPreviousVolunteerStatus,
  updateTicketWithDenial,
  updateVolunteerStatus,
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
  console.log(
    `[handle-answer] Volunteer ${volunteer.id} denied match for support request ${supportRequest.zendeskTicketId}`
  );
  await updateTicketWithDenial(supportRequest.zendeskTicketId, volunteer);

  await denyMatchConfirmation(matchConfirmation.matchConfirmationId);

  await addSupportRequestToQueue(matchConfirmation.supportRequestId);

  const previousVolunteerStatus = await fetchPreviousVolunteerStatus(
    volunteer.id
  );

  await updateVolunteerStatus(volunteer, previousVolunteerStatus);
}
