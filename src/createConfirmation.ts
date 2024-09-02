import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, number, string } from "yup";
import { getErrorMessage, isJsonString, stringfyBigInt } from "./utils";
import { MatchStage, MatchType } from "@prisma/client";
import confirmMatch from "./matchConfirmation/confirmMatch";
import { fetchSupportRequestAndVolunteer } from "./matchConfirmation/matchConfirmationLogic";

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

    const { supportRequest, volunteer } = await fetchSupportRequestAndVolunteer(
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
      throw new Error(
        `Couldn't create match confirmation for support_request_id ${supportRequestId} and volunteer_id ${volunteerId}`
      );

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

      console.error(`[create-match-confirmation] - [400]: ${errorMsg}`);

      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: errorMsg,
        }),
      });
    }

    const errorMsg = getErrorMessage(error);
    console.error(`[create-match-confirmation] - [500]: ${errorMsg}`);

    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    });
  }
}
