import acceptMatch from "../matchAccepted/acceptMatch";
import { ButtonText, type TwilioMessage } from "../types";
import { cleanPhone } from "../utils";
import {
  sendContinueAvailableReply,
  sendErrorReply,
  sendGenericReply,
  sendNegativeReply,
  sendPositiveReply,
  sendUnregistrationReply,
} from "./replyLogic";

export default async function sendReply(
  phone: string,
  buttonText?: ButtonText,
  buttonPayload?: string
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

  const shouldAcceptMatch =
    !!buttonPayload && buttonText === ButtonText.positive;
  if (shouldAcceptMatch) {
    const match = await acceptMatch(buttonPayload);
    if (!match) {
      const reply = await sendErrorReply(cleanedPhone);
      return reply;
    }
  }

  return reply;
}
