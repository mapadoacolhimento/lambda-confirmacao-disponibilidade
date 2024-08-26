import type { Matches, Volunteers } from "@prisma/client";
import { LAMBDA_MATCH_URL } from "../constants";
import client from "../prismaClient";
import updateTicket from "../zendeskClient/updateTicket";

export function getMatchConfirmationId(buttonPayload: string) {
  const matchConfirmationId = Number(buttonPayload.split("_")[1]);
  return matchConfirmationId;
}

export async function fetchMatchConfirmation(matchConfirmationId: number) {
  const matchConfirmation = await client.matchConfirmations.findUnique({
    where: {
      matchConfirmationId: matchConfirmationId,
      status: "waiting",
    },
  });
  return matchConfirmation;
}

export async function confirmMatchConfirmation(matchConfirmationId: number) {
  await client.matchConfirmations.update({
    where: {
      matchConfirmationId: matchConfirmationId,
    },
    data: {
      status: "confirmed",
      updatedAt: new Date().toISOString(),
    },
  });

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

async function authenticateMatch() {
  const authResponse = await fetch(LAMBDA_MATCH_URL + "/sign");
  if (authResponse.status !== 200 || !authResponse.ok) {
    throw new Error(authResponse.statusText);
  }
  const authData = (await authResponse.json()) as { message: string };

  return authData.message;
}

export async function createMatch(
  supportRequestId: number,
  volunteerId: number
) {
  const authToken = await authenticateMatch();

  const options = {
    method: "POST",
    body: JSON.stringify({
      supportRequestId: supportRequestId,
      volunteerId: volunteerId,
      matchType: "daily",
      matchStage: "ideal",
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

  const match = matchData.message;

  return match;
}
