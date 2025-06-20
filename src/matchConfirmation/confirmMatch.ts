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
  undeliveredMatchConfirmation,
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
  const matchConfirmation = await createMatchConfirmation(
    supportRequest,
    volunteer.id,
    matchInfo
  );

  try {
    await sendWhatsAppMessage(
      volunteer,
      supportRequest,
      matchConfirmation.matchConfirmationId
    );
  } catch (error) {
    await undeliveredMatchConfirmation(matchConfirmation.matchConfirmationId);
    throw new Error(error instanceof Error ? error.message : String(error));
  }

  await updateMsrZendeskTicket(supportRequest.zendeskTicketId, volunteer);

  await updateSupportRequest(supportRequest.supportRequestId);

  await makeVolunteerUnavailable(volunteer);

  return matchConfirmation;
}
