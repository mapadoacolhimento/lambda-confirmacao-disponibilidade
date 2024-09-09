import type { MatchConfirmations } from "@prisma/client";
import acceptMatch from "../matchAccepted/acceptMatch";
import denyMatch from "../matchDenied/denyMatch";
import { ReplyType } from "../types";
import { fetchSupportRequestAndVolunteer } from "./matchConfirmationLogic";

export default async function processMatchConfirmation(
  matchConfirmation: Pick<
    MatchConfirmations,
    | "matchConfirmationId"
    | "msrId"
    | "supportRequestId"
    | "volunteerId"
    | "matchType"
    | "matchStage"
  >,
  buttonText: ReplyType.positive | ReplyType.negative
) {
  const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  const shouldAcceptMatch = buttonText === ReplyType.positive;
  if (shouldAcceptMatch) {
    await acceptMatch(matchConfirmation, supportRequest, volunteer);
    return matchConfirmation;
  }

  await denyMatch(matchConfirmation, supportRequest, volunteer);

  return matchConfirmation;
}
