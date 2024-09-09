import { ReplyType, type TwilioMessage } from "../types";
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
  buttonText: ReplyType = ReplyType.generic
): Promise<TwilioMessage> {
  const REPLY_FUNCTIONS = {
    [ReplyType.positive]: sendPositiveReply,
    [ReplyType.negative]: sendNegativeReply,
    [ReplyType.continue]: sendContinueAvailableReply,
    [ReplyType.unregistration]: sendUnregistrationReply,
    [ReplyType.generic]: sendGenericReply,
    [ReplyType.error]: sendErrorReply,
  };

  const replyFunction = REPLY_FUNCTIONS[buttonText];

  const reply = await replyFunction(phone);

  return reply;
}
