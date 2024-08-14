import type { Matches, Volunteers } from "@prisma/client";
import { ZENDESK_CUSTOM_FIELDS_DICIO } from "../constants";
import client from "../prismaClient";
import updateTicket from "../zendeskClient/updateTicket";

export async function createMatchConfirmation(
  supportRequestId: number,
  msrId: bigint,
  volunteerId: number,
  matchInfo: Pick<Matches, "matchType" | "matchStage">
) {
  const matchConfirmation = await client.matchConfirmations.create({
    data: {
      supportRequestId: supportRequestId,
      msrId: msrId,
      volunteerId: volunteerId,
      status: "waiting",
      matchType: matchInfo.matchType,
      matchStage: matchInfo.matchStage,
      MatchConfirmationStatusHistory: {
        create: {
          status: "waiting",
        },
      },
    },
  });

  return matchConfirmation;
}

export async function updateMsrZendeskTicket(
  zendeskTicketId: bigint,
  volunteer: Pick<Volunteers, "firstName" | "zendeskUserId">
) {
  const ticket = {
    id: zendeskTicketId,
    custom_fields: [
      {
        id: ZENDESK_CUSTOM_FIELDS_DICIO["status_acolhimento"],
        value: "encaminhamento__aguardando_confirmação",
      },
    ],
    comment: {
      body: `**Encaminhamento: Aguardando Confirmação** \n\n Enviamos uma mensagem para a [Voluntária ${volunteer.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteer.zendeskUserId}) e estamos aguardando a sua confirmação para realizar o encaminhamento.`,
      public: false,
    },
  };

  const zendeskTicket = await updateTicket(ticket);

  return zendeskTicket;
}
