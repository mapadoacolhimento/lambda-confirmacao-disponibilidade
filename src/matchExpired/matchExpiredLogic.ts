import type { Volunteers } from "@prisma/client";
import {
  ZENDESK_CUSTOM_FIELDS_DICIO,
  ZENDESK_TICKET_WAITING_FOR_MATCH_STATUS,
} from "../constants";
import updateTicket from "../zendeskClient/updateTicket";
import client from "../prismaClient";

export async function updateTicketWithExpiration(
  zendeskTicketId: bigint,
  volunteer: Pick<Volunteers, "firstName" | "zendeskUserId">
) {
  const ticket = {
    id: zendeskTicketId,
    custom_fields: [
      {
        id: ZENDESK_CUSTOM_FIELDS_DICIO["status_acolhimento"],
        value: ZENDESK_TICKET_WAITING_FOR_MATCH_STATUS,
      },
    ],
    comment: {
      body: `A [Voluntária ${volunteer.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteer.zendeskUserId}) não respondeu após 24h.\n\nO pedido de acolhimento foi encaminhado para a fila do Match Diário.`,
      public: false,
    },
  };

  const zendeskTicket = await updateTicket(ticket);

  if (!zendeskTicket)
    throw new Error(
      `Couldn't update msr Zendesk ticket for zendesk_ticket_id: ${zendeskTicketId}`
    );
}

export async function expireMatchConfirmation(matchConfirmationId: number) {
  await client.matchConfirmations.update({
    where: {
      matchConfirmationId: matchConfirmationId,
    },
    data: {
      status: "expired",
      updatedAt: new Date().toISOString(),
    },
  });

  await client.matchConfirmationStatusHistory.create({
    data: {
      matchConfirmationId: matchConfirmationId,
      status: "expired",
      createdAt: new Date().toISOString(),
    },
  });
}
