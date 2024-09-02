import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, string } from "yup";
import { getErrorMessage, stringfyBigInt, parseParamsToJson } from "./utils";
import sendReply from "./reply/sendReply";
import { ButtonText } from "./types";
import processMatchConfirmation from "./matchConfirmation/processMatchConfirmation";

const bodySchema = object({
  MessageSid: string().required(),
  From: string().required(),
  ButtonText: string().oneOf(Object.values(ButtonText)),
  ButtonPayload: string(),
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

    const {
      From: from,
      ButtonText: buttonText,
      ButtonPayload: buttonPayload,
    } = validatedBody;

    const reply = await sendReply(from, buttonText);

    if (buttonText && buttonPayload)
      await processMatchConfirmation(buttonText, buttonPayload);

    const bodyRes = JSON.stringify({
      message: stringfyBigInt(reply),
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
