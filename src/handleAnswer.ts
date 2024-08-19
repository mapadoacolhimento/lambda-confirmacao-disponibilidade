import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, string } from "yup";
import { getErrorMessage, stringfyBigInt } from "./utils";
import { parseParamsToJson } from "./utils";

const bodySchema = object({
  MessageSid: string().required(),
  Body: string().required(),
  MessageType: string(),
  ButtonText: string(),
}).required();

export default async function handler(
  event: APIGatewayEvent,
  _context: Context,
  callback: APIGatewayProxyCallback
) {
  try {
    const body = event.body;

    const parsedBody =
      (parseParamsToJson(body) as unknown) ||
      (Object.create(null) as Record<string, unknown>);

    const validatedBody = await bodySchema.validate(parsedBody);

    const bodyRes = JSON.stringify({
      message: stringfyBigInt(validatedBody),
    });

    return callback(null, {
      statusCode: 200,
      body: bodyRes,
    });
  } catch (e) {
    const error = e as Record<string, unknown>;
    if (error["name"] === "ValidationError") {
      const errorMsg = `Validation error: ${getErrorMessage(error)}`;

      console.error(`[handle-answer] - [400]: ${errorMsg}`);

      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: errorMsg,
        }),
      });
    }

    const errorMsg = getErrorMessage(error);
    console.error(`[handle-answer] - [500]: ${errorMsg}`);

    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    });
  }
}
