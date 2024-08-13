import { MSR_EMAIL_TRANSACTIONAL_ID } from "../constants";
import sendEmail from "./sendEmail";

export async function sendEmailToMsr(email: string, firstName: string) {
  const emailVars = {
    msr_first_name: firstName,
  };

  const emailRes = await sendEmail(
    email,
    MSR_EMAIL_TRANSACTIONAL_ID,
    emailVars
  );

  return emailRes;
}
