import {
  WHATSAPP_CONTINUE_AVAILABLE_REPLY,
  WHATSAPP_GENERIC_REPLY,
  WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID,
  WHATSAPP_POSITIVE_REPLY,
  WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID,
} from "../constants";
import sendOpenReply from "../twilioClient/sendOpenReply";
import sendTemplateMessage from "../twilioClient/sendTemplateMessage";

export async function sendGenericReply(phone: string) {
  const message = await sendOpenReply(WHATSAPP_GENERIC_REPLY, phone);
  return message;
}

export async function sendPositiveReply(phone: string) {
  const message = await sendOpenReply(WHATSAPP_POSITIVE_REPLY, phone);
  return message;
}

export async function sendNegativeReply(phone: string) {
  const contentVariables = {};
  const message = await sendTemplateMessage(
    WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID,
    phone,
    contentVariables
  );
  return message;
}

export async function sendContinueAvailableReply(phone: string) {
  const message = await sendOpenReply(WHATSAPP_CONTINUE_AVAILABLE_REPLY, phone);
  return message;
}

export async function sendUnregistrationReply(phone: string) {
  const contentVariables = {};
  const message = await sendTemplateMessage(
    WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID,
    phone,
    contentVariables
  );
  return message;
}
