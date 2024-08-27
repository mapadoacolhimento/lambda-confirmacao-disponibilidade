import { ButtonText, type TwilioMessage } from "../types";
import { cleanPhone } from "../utils";
import {
  sendContinueAvailableReply,
  sendGenericReply,
  sendNegativeReply,
  sendPositiveReply,
  sendUnregistrationReply,
} from "./replyLogic";

export default async function sendReply(
  phone: string,
  buttonText?: ButtonText
): Promise<TwilioMessage> {
  const cleanedPhone = cleanPhone(phone);

  if (!buttonText) {
    const reply = await sendGenericReply(cleanedPhone);
    return reply;
  }

  const ANSWER_TYPES = {
    [ButtonText.positive]: sendPositiveReply,
    [ButtonText.negative]: sendNegativeReply,
    [ButtonText.continue]: sendContinueAvailableReply,
    [ButtonText.unregistration]: sendUnregistrationReply,
  };

  const sendReply = ANSWER_TYPES[buttonText] || sendGenericReply;

  const reply = await sendReply(cleanedPhone);

  return reply;
}
