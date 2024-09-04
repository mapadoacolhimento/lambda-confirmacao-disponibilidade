import {
  fetchMatchConfirmation,
  getMatchConfirmationId,
} from "../matchConfirmation/matchConfirmationLogic";
import processMatchConfirmation from "../matchConfirmation/processMatchConfirmation";
import sendReply from "../reply/sendReply";

import { ReplyType } from "../types";
import { cleanPhone } from "../utils";

export default async function handleVolunteerAnswer(
  from: string,
  buttonText?: ReplyType,
  buttonPayload?: string
) {
  const phone = cleanPhone(from);

  const shouldProcessMatchConfirmation =
    !!buttonPayload &&
    (buttonText === ReplyType.positive || buttonText === ReplyType.negative);

  if (!shouldProcessMatchConfirmation) {
    const reply = await sendReply(phone, buttonText);
    return reply;
  }

  const matchConfirmationId = getMatchConfirmationId(buttonPayload);
  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);

  if (!matchConfirmation) {
    const reply = await sendReply(phone, ReplyType.error);
    return reply;
  }

  const reply = await sendReply(phone, buttonText);

  await processMatchConfirmation(matchConfirmation, buttonText);

  return reply;
}
