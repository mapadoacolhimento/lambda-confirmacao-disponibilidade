import type { MSRPiiSec } from "@prisma/client";
import { sendEmailToMsr } from "../emailClient";

export async function checkAvailability(msrPII: MSRPiiSec) {
  const email = await sendEmailToMsr(
    msrPII.email,
    msrPII.firstName || "acolhida"
  );

  return email;
}
