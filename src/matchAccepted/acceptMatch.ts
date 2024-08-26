import { fetchSupportRequestAndVolunteer } from "../utils";
import {
  confirmMatchConfirmation,
  createMatch,
  fetchMatchConfirmation,
  getMatchConfirmationId,
  updateTicketWithConfirmation,
} from "./matchAcceptedLogic";

export default async function acceptMatch(buttonPayload: string) {
  const matchConfirmationId = getMatchConfirmationId(buttonPayload);

  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);
  if (!matchConfirmation) return null;

  const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  await updateTicketWithConfirmation(supportRequest.zendeskTicketId, volunteer);

  await confirmMatchConfirmation(matchConfirmation.matchConfirmationId);

  const match = await createMatch(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  return match;
}
