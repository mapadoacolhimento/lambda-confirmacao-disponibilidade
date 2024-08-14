import type {
  Matches,
  MSRPiiSec,
  SupportRequests,
  Volunteers,
} from "@prisma/client";
import {
  createMatchConfirmation,
  updateMsrZendeskTicket,
} from "./matchConfirmationLogic";

export default async function confirmMatch(
  supportRequest: Pick<SupportRequests, "supportRequestId" | "zendeskTicketId">,
  msrPII: Pick<MSRPiiSec, "msrId">,
  volunteer: Pick<Volunteers, "id" | "firstName" | "zendeskUserId">,
  matchInfo: Pick<Matches, "matchType" | "matchStage">
) {
  const updatedTicket = await updateMsrZendeskTicket(
    supportRequest.zendeskTicketId,
    volunteer
  );

  if (!updatedTicket) return null;

  const matchConfirmation = await createMatchConfirmation(
    supportRequest.supportRequestId,
    msrPII.msrId,
    volunteer.id,
    matchInfo
  );

  return matchConfirmation;
}
