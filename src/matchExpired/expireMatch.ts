import {
  fetchMatchConfirmation,
  fetchSupportRequestAndVolunteer,
} from "../matchConfirmation/matchConfirmationLogic";
import {
  addSupportRequestToQueue,
  fetchPreviousVolunteerStatus,
  updateVolunteerStatus,
} from "../matchDenied/matchDeniedLogic";
import { sendExpirationReply } from "../reply/replyLogic";
import {
  expireMatchConfirmation,
  updateTicketWithExpiration,
} from "./matchExpiredLogic";

export default async function expireMatch(matchConfirmationId: number) {
  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);

  if (!matchConfirmation) return null;

  console.log(
    `[expire] Expiring match confirmation for match_confirmation_id: ${matchConfirmationId}`
  );
  const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  await updateTicketWithExpiration(supportRequest.zendeskTicketId, volunteer);

  await expireMatchConfirmation(matchConfirmation.matchConfirmationId);

  await addSupportRequestToQueue(matchConfirmation.supportRequestId);

  const previousVolunteerStatus = await fetchPreviousVolunteerStatus(
    volunteer.id
  );

  console.log(
    `[expire] Updating volunteer status to previous value for volunteerId: ${volunteer.id}`
  );
  await updateVolunteerStatus(volunteer, previousVolunteerStatus);

  await sendExpirationReply(volunteer.phone);

  return matchConfirmation;
}
