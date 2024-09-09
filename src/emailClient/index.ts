import type { MSRPiiSec, SupportRequests } from "@prisma/client";
import { MSR_EMAIL_TRANSACTION_ID } from "../constants";
import sendEmail from "./sendEmail";

export async function sendEmailToMsr(
  msr: Pick<MSRPiiSec, "email" | "firstName">,
  supportRequest: Pick<SupportRequests, "supportRequestId" | "supportType">
) {
  const emailVars = {
    msr_first_name: msr.firstName || "Acolhida",
    support_request_id: supportRequest.supportRequestId.toString(),
    volunteer_type:
      supportRequest.supportType === "legal" ? "advogada" : "psicóloga",
  };

  const emailRes = await sendEmail(
    msr.email,
    MSR_EMAIL_TRANSACTION_ID,
    emailVars
  );

  return emailRes;
}
