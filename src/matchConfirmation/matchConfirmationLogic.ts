import type { Matches, SupportRequests, Volunteers } from "@prisma/client";
import {
  WHATSAPP_TEMPLATE_WITH_CITY_ID,
  WHATSAPP_TEMPLATE_WITHOUT_CITY_ID,
  ZENDESK_CUSTOM_FIELDS_DICIO,
  ZENDESK_TICKET_WAITING_FOR_CONFIRMATION_STATUS,
  ZENDESK_USER_WAITING_FOR_CONFIRMATION_STATUS,
} from "../constants";
import client from "../prismaClient";
import updateTicket from "../zendeskClient/updateTicket";
import type { ZendeskUser } from "../types";
import updateUser from "../zendeskClient/updateUser";
import sendTemplateMessage from "../twilioClient/sendTemplateMessage";

export async function fetchSupportRequestAndVolunteer(
  supportRequestId: number,
  volunteerId: number
) {
  const volunteer = await client.volunteers.findUniqueOrThrow({
    where: {
      id: volunteerId,
      phone: {
        not: "not_found",
      },
      zendeskUserId: {
        not: null,
      },
    },
    select: {
      id: true,
      firstName: true,
      phone: true,
      zendeskUserId: true,
    },
  });

  const supportRequest = await client.supportRequests.findUniqueOrThrow({
    where: { supportRequestId: supportRequestId },
    select: {
      supportRequestId: true,
      msrId: true,
      zendeskTicketId: true,
      city: true,
      state: true,
    },
  });

  return { supportRequest, volunteer };
}

export async function createMatchConfirmation(
  supportRequest: Pick<SupportRequests, "supportRequestId" | "msrId">,
  volunteerId: number,
  matchInfo: Pick<Matches, "matchType" | "matchStage">
) {
  const matchConfirmation = await client.matchConfirmations.create({
    data: {
      supportRequestId: supportRequest.supportRequestId,
      msrId: supportRequest.msrId,
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
        value: ZENDESK_TICKET_WAITING_FOR_CONFIRMATION_STATUS,
      },
    ],
    comment: {
      body: `**Encaminhamento: Aguardando Confirmação** \n\n Enviamos uma mensagem para a [Voluntária ${volunteer.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteer.zendeskUserId}) e estamos aguardando a sua confirmação para realizar o encaminhamento.`,
      public: false,
    },
  };

  const zendeskTicket = await updateTicket(ticket);

  if (!zendeskTicket)
    throw new Error(
      `Couldn't update msr Zendesk ticket for zendesk_ticket_id: ${zendeskTicketId}`
    );

  return zendeskTicket;
}

export async function makeVolunteerUnavailable(
  volunteer: Pick<Volunteers, "id" | "zendeskUserId">
) {
  const volunteerZendeskUser: Pick<ZendeskUser, "id" | "user_fields"> = {
    id: volunteer.zendeskUserId as bigint,
    user_fields: { condition: ZENDESK_USER_WAITING_FOR_CONFIRMATION_STATUS },
  };
  const updatedZendeskUser = await updateUser(volunteerZendeskUser);

  if (!updatedZendeskUser)
    throw new Error(
      `Couldn't update volunteer Zendesk status for zendesk_user_id: ${volunteer.zendeskUserId} `
    );

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

export async function sendWhatsAppMessage(
  volunteer: Pick<Volunteers, "id" | "firstName" | "phone">,
  supportRequest: Pick<SupportRequests, "city" | "state">,
  matchConfirmationId: number
) {
  const contentVariables = {
    volunteerName: volunteer.firstName,
    matchConfirmationId: matchConfirmationId.toString(),
  };

  const msrHasCity =
    supportRequest.city &&
    supportRequest.city !== "not_found" &&
    supportRequest.state &&
    supportRequest.state !== "not_found";

  if (!msrHasCity) {
    const message = await sendTemplateMessage(
      WHATSAPP_TEMPLATE_WITHOUT_CITY_ID,
      volunteer.phone,
      contentVariables
    );

    if (!message || message.status != "accepted")
      throw new Error(
        `Couldn't send whatsapp message to volunteer for volunteer_id: ${volunteer.id}`
      );

    return message;
  }

  const city = await client.cities.findFirst({
    where: {
      city_value: supportRequest.city as string,
      state: supportRequest.state as string,
    },
    select: {
      city_label: true,
    },
  });

  const cityPrettyName =
    initCap(city?.city_label || (supportRequest.city as string)) +
    " (" +
    supportRequest.state +
    ")";

  const message = await sendTemplateMessage(
    WHATSAPP_TEMPLATE_WITH_CITY_ID,
    volunteer.phone,
    {
      ...contentVariables,
      msrCity: cityPrettyName,
    }
  );

  if (!message || message.status != "accepted")
    throw new Error(
      `Couldn't send whatsapp message to volunteer for volunteer_id: ${volunteer.id}`
    );

  return message;
}

export function initCap(cityName: string) {
  const words = cityName.split(" ");

  const cityNameInitCap = words
    .map((word: string) => {
      return word[0]?.toUpperCase() + word.substring(1).toLowerCase();
    })
    .join(" ");

  return cityNameInitCap;
}

export function getMatchConfirmationId(buttonPayload: string) {
  const matchConfirmationId = Number(buttonPayload.split("_")[1]);
  return matchConfirmationId;
}

export async function fetchMatchConfirmation(matchConfirmationId: number) {
  const matchConfirmation = await client.matchConfirmations.findUniqueOrThrow({
    where: {
      matchConfirmationId: matchConfirmationId,
      status: "waiting",
    },
    select: {
      matchConfirmationId: true,
      supportRequestId: true,
      volunteerId: true,
      matchType: true,
      matchStage: true,
    },
  });
  return matchConfirmation;
}
