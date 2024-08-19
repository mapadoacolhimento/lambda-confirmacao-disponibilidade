import {
  CONTINUE_AVAILABLE_ANSWER,
  NEGATIVE_ANSWER,
  POSITIVE_ANSWER,
  UNREGISTRATION_ANSWER,
  WHATSAPP_CONTINUE_AVAILABLE_REPLY,
  WHATSAPP_GENERIC_REPLY,
  WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID,
  WHATSAPP_POSITIVE_REPLY,
  WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID,
} from "../constants";
import sendOpenReply from "../twilioClient/sendOpenReply";
import sendTemplateMessage from "../twilioClient/sendTemplateMessage";
import { cleanPhone } from "../utils";

export default async function sendReply(
  messageType: string,
  phone: string,
  buttonText: string | undefined
) {
  const cleanedPhone = cleanPhone(phone);
  let reply = null;

  if (messageType === "button") {
    if (buttonText === POSITIVE_ANSWER)
      reply = await sendPositiveReply(cleanedPhone);

    if (buttonText === NEGATIVE_ANSWER)
      reply = await sendNegativeReply(cleanedPhone);

    return reply;
  }

  if (messageType === "interactive") {
    if (buttonText === CONTINUE_AVAILABLE_ANSWER)
      reply = await sendContinueAvailableReply(cleanedPhone);

    if (buttonText === UNREGISTRATION_ANSWER)
      reply = await sendUnregistrationReply(cleanedPhone);

    return reply;
  }

  reply = await sendGenericReply(cleanedPhone);
  return reply;
}

async function sendGenericReply(phone: string) {
  const message = await sendOpenReply(WHATSAPP_GENERIC_REPLY, phone);
  return message;
}

async function sendPositiveReply(phone: string) {
  const message = await sendOpenReply(WHATSAPP_POSITIVE_REPLY, phone);
  return message;
}

async function sendNegativeReply(phone: string) {
  const contentVariables = {};
  const message = await sendTemplateMessage(
    WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID,
    phone,
    contentVariables
  );
  return message;
}

async function sendContinueAvailableReply(phone: string) {
  const message = await sendOpenReply(WHATSAPP_CONTINUE_AVAILABLE_REPLY, phone);
  return message;
}

async function sendUnregistrationReply(phone: string) {
  const contentVariables = {};
  const message = await sendTemplateMessage(
    WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID,
    phone,
    contentVariables
  );
  return message;
}
