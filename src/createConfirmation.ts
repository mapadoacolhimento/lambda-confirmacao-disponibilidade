import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, number } from "yup";

import client from "./prismaClient";

import {
  getErrorMessage,
  isJsonString,
  notFoundErrorPayload,
  stringfyBigInt,
} from "./utils";

const bodySchema = object({
  supportRequestId: number().required(),
  msrId: number().required(),
  volunteerId: number().required(),
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

    if (!body) {
      const errorMessage = "Empty request body";
      console.error(`[create-match] - [400]: ${errorMessage}`);

      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: errorMessage,
        }),
      });
    }

    const parsedBody = isJsonString(body)
      ? (JSON.parse(body) as unknown)
      : (Object.create(null) as Record<string, unknown>);

    const validatedBody = await bodySchema.validate(parsedBody);

    const { supportRequestId, volunteerId } = validatedBody;

    const supportRequest = await client.supportRequests.findUnique({
      where: { supportRequestId: supportRequestId },
    });

    if (!supportRequest) {
      const errorMessage = `support_request not found for support_request_id '${supportRequestId}'`;

      return callback(null, notFoundErrorPayload("create-match", errorMessage));
    }

    const volunteer = await client.volunteers.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      const errorMessage = `volunteer not found for volunteer_id '${volunteerId}'`;

      return callback(null, notFoundErrorPayload("create-match", errorMessage));
    }

    //   const match = await createMatch(
    //     supportRequest,
    //     volunteerAvailability,
    //     matchType,
    //     matchStage
    //   );

    //   const bodyRes = JSON.stringify({
    //     message: stringfyBigInt(match),
    //   });

    const bodyRes = JSON.stringify({
      message: stringfyBigInt(supportRequest),
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
