import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import { handleAnswer } from "../../handler";
import * as sendReply from "../reply/sendReply";
import * as handleVolunteerAnswer from "../handleVolunteerAnswer/handleVolunteerAnswer";
import { replyMock } from "../reply/__mocks__";

const callback = jest.fn();

const defaultBody =
  "MessageType=text&Body=Oi&MessageSid=SM802c0d39a503aae472cee7379abff9f6&From=whatsapp%3A%2B5511123456789";

const sendReplyMock = jest.spyOn(sendReply, "default");
const handleVolunteerAnswerMock = jest.spyOn(handleVolunteerAnswer, "default");

describe("/handle-answer endpoint", () => {
  it("should return an error res when no body is provided to the req", async () => {
    await handleAnswer(
      {
        body: null,
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: "Empty request body",
      }),
    });
  });

  it("should return an error res when req body is invalid", async () => {
    await handleAnswer(
      {
        body: JSON.stringify({
          MessageSid: "ABC",
        }),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: `Validation error: From is a required field`,
      }),
    });
  });

  it("should call handleVolunteerAnswer with correct params", async () => {
    await handleAnswer(
      {
        body: defaultBody,
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(handleVolunteerAnswerMock).toHaveBeenNthCalledWith(
      1,
      "whatsapp%3A%2B5511123456789",
      undefined,
      undefined
    );
  });

  it("should return an error if the reply wasn't correctly sent", async () => {
    sendReplyMock.mockRejectedValue(
      new Error(`Couldn't send whatsapp message to phone: 5511123456789`)
    );

    await handleAnswer(
      {
        body: defaultBody,
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: `Couldn't send whatsapp message to phone: 5511123456789`,
      }),
    });
  });

  it("should return the reply", async () => {
    sendReplyMock.mockResolvedValueOnce(replyMock);

    await handleAnswer(
      {
        body: defaultBody,
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      body: "",
    });
  });
});
