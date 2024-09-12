import twilioClient from ".";
import { WHATSAPP_SENDER_ID } from "../constants";
import type { TwilioMessage } from "../types/Twilio";

export default async function sendOpenReply(
  body: string,
  phone: string
): Promise<TwilioMessage | null> {
  const message = await twilioClient.messages.create({
    from: WHATSAPP_SENDER_ID!,
    to: "whatsapp:+55" + phone,
    body: body,
  });

  return message;
}
