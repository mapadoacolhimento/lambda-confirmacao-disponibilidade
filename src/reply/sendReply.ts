import {
  CONTINUE_AVAILABLE_ANSWER,
  NEGATIVE_ANSWER,
  POSITIVE_ANSWER,
  UNREGISTRATION_ANSWER,
} from "../constants";
import { cleanPhone } from "../utils";
import {
  sendContinueAvailableReply,
  sendGenericReply,
  sendNegativeReply,
  sendPositiveReply,
  sendUnregistrationReply,
} from "./replyLogic";

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
