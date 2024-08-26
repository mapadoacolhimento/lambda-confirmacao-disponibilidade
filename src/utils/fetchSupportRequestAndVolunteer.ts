import client from "../prismaClient";

export default async function fetchSupportRequestAndVolunteer(
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
