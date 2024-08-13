import client from "../prismaClient";

export async function createMatchConfirmation(
  supportRequestId: number,
  msrId: bigint,
  volunteerId: number
) {
  const matchConfirmation = await client.matchConfirmations.create({
    data: {
      supportRequestId: supportRequestId,
      msrId: msrId,
      volunteerId: volunteerId,
      status: "waiting",
      MatchConfirmationStatusHistory: {
        create: {
          status: "waiting",
        },
      },
    },
  });

  return matchConfirmation;
}
