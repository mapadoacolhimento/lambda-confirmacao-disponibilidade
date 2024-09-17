import type {
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { object, string } from "yup";
import { getErrorMessage, isJsonString } from "./utils";
import handleVolunteerAnswer from "./handleVolunteerAnswer/handleVolunteerAnswer";
import { ReplyType } from "./types";

const bodySchema = object({
  MessageSid: string().required(),
  From: string().required(),
  ButtonText: string().oneOf(Object.values(ReplyType)),
  ButtonPayload: string(),
}).required();

export default async function handler(
  event: APIGatewayEvent,
  _context: Context,
  callback: APIGatewayProxyCallback
) {
  try {
    const body = event.body;

    if (!body) {
      const errorMessage = "Empty request body";
      console.error(`[handle-answer] - [400]: ${errorMessage}`);

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

    const {
      From: from,
      ButtonText: buttonText,
      ButtonPayload: buttonPayload,
    } = validatedBody;

    const reply = await handleVolunteerAnswer(from, buttonText, buttonPayload);

    return callback(null, {
      statusCode: 200,
      body: reply,
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
