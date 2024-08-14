import type { MSRPiiSec } from "@prisma/client";
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

  return matchConfirmation;
}
