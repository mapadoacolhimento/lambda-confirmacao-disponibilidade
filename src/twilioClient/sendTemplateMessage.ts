import twilioClient from ".";
import { WHATSAPP_SENDER_ID } from "../constants";

export default async function sendTemplateMessage(
  templateId: string,
  phone: string,
  contentVariables: Record<string, string> | null
): Promise<string | null> {
  const message = await twilioClient.messages.create({
    contentSid: templateId,
    contentVariables: JSON.stringify(contentVariables),
    from: WHATSAPP_SENDER_ID!,
    to: "whatsapp:+55" + phone,
  });

  return message.status;
}
