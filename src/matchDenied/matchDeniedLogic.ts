import type { Volunteers } from "@prisma/client";
import type { ZendeskUser } from "../types";
import updateTicket from "../zendeskClient/updateTicket";
import client from "../prismaClient";
import {
  ZENDESK_CUSTOM_FIELDS_DICIO,
  ZENDESK_TICKET_WAITING_FOR_MATCH_STATUS,
  ZENDESK_USER_AVAILABLE_STATUS,
  ZENDESK_USER_WAITING_FOR_CONFIRMATION_STATUS,
} from "../constants";
import updateUser from "../zendeskClient/updateUser";

export async function denyMatchConfirmation(matchConfirmationId: number) {
  await client.matchConfirmations.update({
    where: {
      matchConfirmationId: matchConfirmationId,
    },
    data: {
      status: "denied",
      updatedAt: new Date().toISOString(),
    },
  });

  await client.matchConfirmationStatusHistory.create({
    data: {
      matchConfirmationId: matchConfirmationId,
      status: "denied",
      createdAt: new Date().toISOString(),
    },
  });
}

export async function updateTicketWithDenial(
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
      body: `A [Voluntária ${volunteer.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteer.zendeskUserId}) negou o match.\n\nO pedido de acolhimento foi encaminhado para a fila do Match Diário.`,
      public: false,
    },
  };

  const zendeskTicket = await updateTicket(ticket);

  if (!zendeskTicket)
    throw new Error(
      `Couldn't update msr Zendesk ticket for zendesk_ticket_id: ${zendeskTicketId}`
    );
}

export async function addSupportRequestToQueue(supportRequestId: number) {
  await client.supportRequests.update({
    where: {
      supportRequestId: supportRequestId,
    },
    data: {
      status: "waiting_for_match",
      updatedAt: new Date().toISOString(),
      SupportRequestStatusHistory: {
        create: {
          status: "waiting_for_match",
        },
      },
    },
  });
}

export async function fetchPreviousVolunteerStatus(volunteerId: number) {
  console.log(
    `[${new Date().toISOString()}] Fetching previous volunteer status for volunteerId: ${volunteerId}`
  );
  try {
    const previousStatus = await client.volunteerStatusHistory.findFirstOrThrow(
      {
        where: {
          volunteer_id: volunteerId,
          status: {
            not: ZENDESK_USER_WAITING_FOR_CONFIRMATION_STATUS,
          },
        },
        orderBy: {
          created_at: "desc",
        },
        select: {
          status: true,
        },
      }
    );
    console.log("Found previousStatus:", previousStatus);
    return previousStatus.status;
  } catch (error) {
    throw new Error(
      `[${new Date().toISOString()}] Error fetching previous volunteer ${volunteerId} status: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updateVolunteerStatusToPreviousValue(
  volunteer: Pick<Volunteers, "id" | "zendeskUserId">,
  previousStatus: string
) {
  console.log(
    `[${new Date().toISOString()}] Updating volunteer status to previous value: ${previousStatus} for volunteerId: ${
      volunteer.id
    }`
  );
  const volunteerZendeskUser: Pick<ZendeskUser, "id" | "user_fields"> = {
    id: volunteer.zendeskUserId as bigint,
    user_fields: { condition: previousStatus },
  };
  const updatedZendeskUser = await updateUser(volunteerZendeskUser);

  if (!updatedZendeskUser)
    throw new Error(
      `Couldn't update volunteer Zendesk status for zendesk_user_id: ${volunteer.zendeskUserId} `
    );
  try {
    const updatedVolunteer = await client.volunteers.update({
      where: {
        id: volunteer.id,
      },
      data: {
        condition: previousStatus,
        updated_at: new Date().toISOString(),
      },
    });

    await client.volunteerStatusHistory.create({
      data: {
        volunteer_id: volunteer.id,
        status: previousStatus,
        created_at: new Date().toISOString(),
      },
    });

    await client.volunteerAvailability.update({
      where: {
        volunteer_id: volunteer.id,
      },
      data: {
        is_available: previousStatus == ZENDESK_USER_AVAILABLE_STATUS,
        updated_at: new Date().toISOString(),
      },
    });

    return updatedVolunteer;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error updating volunteer Zendesk status: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}
