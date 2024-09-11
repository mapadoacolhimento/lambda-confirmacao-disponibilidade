import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, number } from "yup";
import { getErrorMessage, isJsonString, stringfyBigInt } from "./utils";
import expireMatch from "./matchExpired/expireMatch";

const bodySchema = object({
  matchConfirmationId: number().required(),
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

    const { matchConfirmationId } = validatedBody;

    const matchConfirmation = await expireMatch(matchConfirmationId);

    if (!matchConfirmation)
      throw new Error(
        `Couldn't expire match confirmation for match_confirmation_id: ${matchConfirmationId}`
      );

    const bodyRes = JSON.stringify({
      message: stringfyBigInt({
        matchConfirmationId: matchConfirmation.matchConfirmationId,
        status: "expired",
      }),
    });

    return callback(null, {
      statusCode: 200,
      body: bodyRes,
    });
  } catch (e) {
    const error = e as Record<string, unknown>;
    if (error["name"] === "ValidationError") {
      const errorMsg = `Validation error: ${getErrorMessage(error)}`;

      console.error(`[expire] - [400]: ${errorMsg}`);

      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: errorMsg,
        }),
      });
    }

    const errorMsg = getErrorMessage(error);
    console.error(`[expire] - [500]: ${errorMsg}`);

    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    });
  }
}
