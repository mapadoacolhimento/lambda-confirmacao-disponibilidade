import type { MSRPiiSec } from "@prisma/client";
import { sendEmailToMsr } from "../emailClient";
import { createMatchConfirmation } from "./confirmationLogic";

export default async function confirmMatch(
  supportRequestId: number,
  msrPII: MSRPiiSec,
  volunteerId: number
) {
  const matchConfirmation = await createMatchConfirmation(
    supportRequestId,
    msrPII.msrId,
    volunteerId
  );

  await sendEmailToMsr(msrPII.email, msrPII.firstName || "acolhida");

  return matchConfirmation;
}
