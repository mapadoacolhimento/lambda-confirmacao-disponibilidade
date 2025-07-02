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
  console.log(`processMatchConfirmation. volunteer ${volunteer.id} `);
  const shouldAcceptMatch = buttonText === ReplyType.positive;
  if (shouldAcceptMatch) {
    console.log(`cceptMatch previousVolunteerStatus ${volunteer.id} `);
    await acceptMatch(matchConfirmation, supportRequest, volunteer);
    return matchConfirmation;
  }

  console.log(`denyMatch previousVolunteerStatus  ${volunteer.id} `);
  await denyMatch(matchConfirmation, supportRequest, volunteer);

  return matchConfirmation;
}
