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
  //   stringfyBigInt,
} from "./utils";
import { checkAvailability } from "./availabilityConfirmation/checkAvailability";

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

    const { supportRequestId, volunteerId, msrId } = validatedBody;

    const supportRequest = await client.supportRequests.findUnique({
      where: { supportRequestId: supportRequestId },
    });

    if (!supportRequest) {
      const errorMessage = `support_request not found for support_request_id '${supportRequestId}'`;

      return callback(
        null,
        notFoundErrorPayload("create-confirmation", errorMessage)
      );
    }

    const volunteer = await client.volunteers.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      const errorMessage = `volunteer not found for volunteer_id '${volunteerId}'`;

      return callback(
        null,
        notFoundErrorPayload("create-confirmation", errorMessage)
      );
    }

    const msrPII = await client.mSRPiiSec.findUnique({
      where: { msrId: msrId },
    });

    if (!msrPII) {
      const errorMessage = `MSR not found for msr_id '${msrId}'`;

      return callback(
        null,
        notFoundErrorPayload("create-confirmation", errorMessage)
      );
    }

    const availabilityConfirmation = await checkAvailability(msrPII);

    const bodyRes = JSON.stringify({
      message: availabilityConfirmation,
      // message: stringfyBigInt(availabilityConfirmation),
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
