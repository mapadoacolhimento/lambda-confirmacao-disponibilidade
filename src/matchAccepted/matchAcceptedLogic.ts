import type { MatchConfirmations, Matches, Volunteers } from "@prisma/client";
import { LAMBDA_MATCH_URL } from "../constants";
import client from "../prismaClient";
import updateTicket from "../zendeskClient/updateTicket";

export async function checkMaxMatches(volunteerId: number) {
  const volunteerAvailability = await client.volunteerAvailability.findUnique({
    where: {
      volunteer_id: volunteerId,
    },
    select: {
      current_matches: true,
      max_matches: true,
    },
  });

  if (volunteerAvailability) {
    const hasReachedMaxMatches =
      volunteerAvailability.current_matches + 1 >=
      volunteerAvailability.max_matches;
    return hasReachedMaxMatches;
  }

  return false;
}

export async function confirmMatchConfirmation(
  matchConfirmationId: number,
  matchId: number
) {
  await client.matchConfirmations.update({
    where: {
      matchConfirmationId: matchConfirmationId,
    },
    data: {
      status: "confirmed",
      matchId: matchId,
      updatedAt: new Date().toISOString(),
    },
  });
  console.log(
    `confirmMatchConfirmation matchConfirmationId: ${matchConfirmationId} matchId: ${matchId}`
  );
  await client.matchConfirmationStatusHistory.create({
    data: {
      matchConfirmationId: matchConfirmationId,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
  });
}

export async function updateTicketWithConfirmation(
  zendeskTicketId: bigint,
  volunteer: Pick<Volunteers, "firstName" | "zendeskUserId">
) {
  const ticket = {
    id: zendeskTicketId,
    comment: {
      body: `A [Voluntária ${volunteer.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteer.zendeskUserId}) confirmou o match.`,
      public: false,
    },
  };

  const zendeskTicket = await updateTicket(ticket);

  if (!zendeskTicket)
    throw new Error(
      `Couldn't update msr Zendesk ticket for zendesk_ticket_id: ${zendeskTicketId}`
    );
}

export async function authenticateMatch() {
  const authResponse = await fetch(LAMBDA_MATCH_URL + "/sign");
  if (authResponse.status !== 200 || !authResponse.ok) {
    throw new Error(authResponse.statusText);
  }
  const authData = (await authResponse.json()) as { message: string };

  return authData.message;
}

export async function createMatch(
  matchConfirmation: Pick<
    MatchConfirmations,
    "supportRequestId" | "volunteerId" | "matchType" | "matchStage"
  >,
  authToken: string
) {
  const options = {
    method: "POST",
    body: JSON.stringify({
      supportRequestId: matchConfirmation.supportRequestId,
      volunteerId: matchConfirmation.volunteerId,
      matchType: matchConfirmation.matchType,
      matchStage: matchConfirmation.matchStage,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken,
    },
  };

  const matchResponse = await fetch(
    LAMBDA_MATCH_URL + "/create-match",
    options
  );

  if (matchResponse.status !== 200 || !matchResponse.ok) {
    throw new Error(matchResponse.statusText);
  }

  const matchData = (await matchResponse.json()) as { message: Matches };
  console.log(
    `createMatch matchConfirmationId: ${matchConfirmation.supportRequestId} volunteerId: ${matchConfirmation.volunteerId} matchType: ${matchConfirmation.matchType} matchStage: ${matchConfirmation.matchStage}`
  );
  const match = matchData.message;

  return match;
}
