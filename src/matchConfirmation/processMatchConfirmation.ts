import acceptMatch from "../matchAccepted/acceptMatch";

import { ButtonText } from "../types";
import {
  fetchSupportRequestAndVolunteer,
  fetchMatchConfirmation,
  getMatchConfirmationId,
} from "./matchConfirmationLogic";

export default async function processMatchConfirmation(
  buttonText: ButtonText,
  buttonPayload: string
) {
  const matchConfirmationId = getMatchConfirmationId(buttonPayload);
  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);

  const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  const shouldAcceptMatch =
    !!buttonPayload && buttonText === ButtonText.positive;
  if (shouldAcceptMatch)
    await acceptMatch(matchConfirmation, supportRequest, volunteer);
}
