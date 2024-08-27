import { fetchSupportRequestAndVolunteer } from "../utils";
import {
  authenticateMatch,
  confirmMatchConfirmation,
  createMatch,
  fetchMatchConfirmation,
  getMatchConfirmationId,
  updateTicketWithConfirmation,
} from "./matchAcceptedLogic";

export default async function acceptMatch(buttonPayload: string) {
  const matchConfirmationId = getMatchConfirmationId(buttonPayload);

  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);

  const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  await updateTicketWithConfirmation(supportRequest.zendeskTicketId, volunteer);

  const authToken = await authenticateMatch();

  const match = await createMatch(matchConfirmation, authToken);

  await confirmMatchConfirmation(
    matchConfirmation.matchConfirmationId,
    match.matchId
  );
}
