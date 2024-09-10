import { sendEmailToMsr } from "../emailClient";
import {
  fetchMatchConfirmation,
  fetchSupportRequestAndVolunteer,
} from "../matchConfirmation/matchConfirmationLogic";
import {
  addSupportRequestToQueue,
  checkPreviousMatchConfirmations,
  fetchMsrPii,
  makeVolunteerAvailable,
} from "../matchDenied/matchDeniedLogic";
import {
  expireMatchConfirmation,
  updateTicketWithExpiration,
} from "./matchExpiredLogic";

export default async function expireMatch(matchConfirmationId: number) {
  const matchConfirmation = await fetchMatchConfirmation(matchConfirmationId);

  console.log({ matchConfirmation });

  if (!matchConfirmation) return null;

  const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
    matchConfirmation.supportRequestId,
    matchConfirmation.volunteerId
  );

  await updateTicketWithExpiration(supportRequest.zendeskTicketId, volunteer);

  await expireMatchConfirmation(matchConfirmation.matchConfirmationId);

  await addSupportRequestToQueue(matchConfirmation.supportRequestId);

  await makeVolunteerAvailable(volunteer);

  const hasPreviousMatchConfirmations =
    await checkPreviousMatchConfirmations(matchConfirmation);

  if (!hasPreviousMatchConfirmations) {
    const msrPii = await fetchMsrPii(matchConfirmation.msrId);

    await sendEmailToMsr(msrPii, supportRequest);
  }

  return matchConfirmation;
}
