import type { Matches, Volunteers } from "@prisma/client";
import { ZENDESK_CUSTOM_FIELDS_DICIO } from "../constants";
import client from "../prismaClient";
import updateTicket from "../zendeskClient/updateTicket";
import type { ZendeskUser } from "../types";
import updateUser from "../zendeskClient/updateUser";

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

export async function updateSupportRequest(supportRequestId: number) {
  const supportRequest = await client.supportRequests.update({
    where: {
      supportRequestId: supportRequestId,
    },
    data: {
      status: "waiting_for_confirmation",
      updatedAt: new Date().toISOString(),
      SupportRequestStatusHistory: {
        create: {
          status: "waiting_for_confirmation",
        },
      },
    },
  });

  return supportRequest;
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

  if (!zendeskTicket) throw new Error("Couldn't update msr Zendesk ticket");

  return zendeskTicket;
}

export async function makeVolunteerUnavailable(
  volunteer: Pick<Volunteers, "id" | "zendeskUserId">
) {
  if (!volunteer.zendeskUserId) return null;

  const volunteerZendeskUser: Pick<ZendeskUser, "id" | "user_fields"> = {
    id: volunteer.zendeskUserId,
    user_fields: { condition: "indisponivel_aguardando_confirmacao" },
  };
  const updatedZendeskUser = await updateUser(volunteerZendeskUser);

  if (!updatedZendeskUser)
    throw new Error("Couldn't update volunteer Zendesk status");

  const updatedVolunteer = await client.volunteers.update({
    where: {
      id: volunteer.id,
    },
    data: {
      condition: "indisponivel_aguardando_confirmacao",
      updated_at: new Date().toISOString(),
    },
  });

  await client.volunteerStatusHistory.create({
    data: {
      volunteer_id: volunteer.id,
      status: "indisponivel_aguardando_confirmacao",
      created_at: new Date().toISOString(),
    },
  });

  await client.volunteerAvailability.update({
    where: {
      volunteer_id: volunteer.id,
    },
    data: {
      is_available: false,
      updated_at: new Date().toISOString(),
    },
  });
  return updatedVolunteer;
}
