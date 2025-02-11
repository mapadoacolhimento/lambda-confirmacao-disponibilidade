import {
  fetchMatchConfirmation,
  fetchSupportRequestAndVolunteer,
} from "../matchConfirmation/matchConfirmationLogic";
import {
  addSupportRequestToQueue,
  fetchPreviousVolunteerStatus,
  updateVolunteerStatusToPreviousValue,
} from "../matchDenied/matchDeniedLogic";
import { sendExpirationReply } from "../reply/replyLogic";
import {
  expireMatchConfirmation,
  updateTicketWithExpiration,
} from "./matchExpiredLogic";

export default async function expireMatch(matchConfirmationId: number) {
  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);

  if (!matchConfirmation) return null;

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

  await updateVolunteerStatusToPreviousValue(
    volunteer,
    previousVolunteerStatus
  );

  await sendExpirationReply(volunteer.phone);

  return matchConfirmation;
}
