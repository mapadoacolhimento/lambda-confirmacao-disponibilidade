import type {
  Matches,
  MSRPiiSec,
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
    "supportRequestId" | "zendeskTicketId" | "city" | "state"
  >,
  msrPII: Pick<MSRPiiSec, "msrId">,
  volunteer: Pick<Volunteers, "id" | "firstName" | "zendeskUserId" | "phone">,
  matchInfo: Pick<Matches, "matchType" | "matchStage">
) {
  const whatsappMessage = await sendWhatsAppMessage(volunteer, supportRequest);
  if (!whatsappMessage) return null;

  const updatedTicket = await updateMsrZendeskTicket(
    supportRequest.zendeskTicketId,
    volunteer
  );
  if (!updatedTicket) return null;

  const updatedSupportRequest = await updateSupportRequest(
    supportRequest.supportRequestId
  );
  if (!updatedSupportRequest) return null;

  const updatedVolunteer = await makeVolunteerUnavailable(volunteer);

  if (!updatedVolunteer) return null;

  const matchConfirmation = await createMatchConfirmation(
    supportRequest.supportRequestId,
    msrPII.msrId,
    volunteer.id,
    matchInfo
  );

  return matchConfirmation;
}
