import twilioClient from ".";
import { WHATSAPP_SENDER_ID } from "../constants";

export default async function sendOpenReply(
  body: string,
  phone: string
): Promise<string | null> {
  const message = await twilioClient.messages.create({
    from: WHATSAPP_SENDER_ID!,
    to: "whatsapp:+55" + phone,
    body: body,
  });

  return message?.status || null;
}
