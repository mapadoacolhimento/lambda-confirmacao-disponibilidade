import twilioClient from ".";
import { WHATSAPP_SENDER_ID } from "../constants";
import type { TwilioMessage } from "../types/Twilio";

export default async function sendTemplateMessage(
  templateId: string,
  phone: string,
  contentVariables: Record<string, string> | null
): Promise<TwilioMessage | null> {
  const message = await twilioClient.messages.create({
    contentSid: templateId,
    contentVariables: JSON.stringify(contentVariables),
    from: WHATSAPP_SENDER_ID,
    to: "whatsapp:+" + phone,
  });

  return message;
}
