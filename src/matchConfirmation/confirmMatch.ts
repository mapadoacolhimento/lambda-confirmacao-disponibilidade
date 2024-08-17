import type {
  MatchConfirmations,
  Matches,
  SupportRequests,
  Volunteers,
} from "@prisma/client";
import {
  createMatchConfirmation,
  makeVolunteerUnavailable,
  sendWhatsAppMessage,
  updateMsrZendeskTicket,
  updateSupportRequest,
} from "./matchConfirmationLogic";

export default async function confirmMatch(
  supportRequest: Pick<
    SupportRequests,
    "supportRequestId" | "msrId" | "zendeskTicketId" | "city" | "state"
  >,
  volunteer: Pick<Volunteers, "id" | "firstName" | "zendeskUserId" | "phone">,
  matchInfo: Pick<Matches, "matchType" | "matchStage">
): Promise<MatchConfirmations | null> {
  await sendWhatsAppMessage(volunteer, supportRequest);

  await updateMsrZendeskTicket(supportRequest.zendeskTicketId, volunteer);

  await updateSupportRequest(supportRequest.supportRequestId);

  await makeVolunteerUnavailable(volunteer);

  const matchConfirmation = await createMatchConfirmation(
    supportRequest,
    volunteer.id,
    matchInfo
  );

  return matchConfirmation;
}
