import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, number, string } from "yup";

import client from "./prismaClient";

import { getErrorMessage, isJsonString, stringfyBigInt } from "./utils";
import { MatchStage, MatchType } from "@prisma/client";
import confirmMatch from "./matchConfirmation/confirmMatch";

const bodySchema = object({
  supportRequestId: number().required(),
  volunteerId: number().required(),
  matchType: string().oneOf(Object.values(MatchType)).required(),
  matchStage: string().oneOf(Object.values(MatchStage)).required(),
})
  .required()
  .strict();

export default async function handler(
  event: APIGatewayEvent,
  _context: Context,
  callback: APIGatewayProxyCallback
) {
  try {
    const body = event.body;

    const parsedBody = isJsonString(body)
      ? (JSON.parse(body as string) as unknown)
      : (Object.create(null) as Record<string, unknown>);

    const validatedBody = await bodySchema.validate(parsedBody);

    const { supportRequestId, volunteerId, matchType, matchStage } =
      validatedBody;

    const { supportRequest, volunteer } = await fetchMatchConfirmationData(
      supportRequestId,
      volunteerId
    );

    const matchInfo = { matchType, matchStage };

    const matchConfirmation = await confirmMatch(
      supportRequest,
      volunteer,
      matchInfo
    );

    if (!matchConfirmation)
      throw new Error("Couldn't create match confirmation");

    const bodyRes = JSON.stringify({
      message: stringfyBigInt(matchConfirmation),
    });

    return callback(null, {
      statusCode: 200,
      body: bodyRes,
    });
  } catch (e) {
    const error = e as Record<string, unknown>;
    if (error["name"] === "ValidationError") {
      const errorMsg = `Validation error: ${getErrorMessage(error)}`;

      console.error(`[create-match] - [400]: ${errorMsg}`);

      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: errorMsg,
        }),
      });
    }

    const errorMsg = getErrorMessage(error);
    console.error(`[create-match] - [500]: ${errorMsg}`);

    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    });
  }
}

async function fetchMatchConfirmationData(
  supportRequestId: number,
  volunteerId: number
) {
  const volunteer = await client.volunteers.findUniqueOrThrow({
    where: {
      id: volunteerId,
      phone: {
        not: "not_found",
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
