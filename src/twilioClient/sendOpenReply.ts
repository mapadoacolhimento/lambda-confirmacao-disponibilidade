import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  WHATSAPP_SENDER_ID,
} from "../constants";
import type { TwilioMessage } from "../types/Twilio";
import twilio from "twilio";

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default async function sendOpenReply(
  body: string,
  phone: string
): Promise<TwilioMessage | null> {
  const message = await twilioClient.messages.create({
    from: WHATSAPP_SENDER_ID,
    to: "whatsapp:+" + phone,
    body: body,
  });

  return message;
}
