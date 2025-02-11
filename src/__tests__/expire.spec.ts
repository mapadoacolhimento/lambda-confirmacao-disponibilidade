import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import { expire } from "../../handler";
import { prismaMock } from "../setupTests";
import * as expireMatch from "../matchExpired/expireMatch";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerMock,
  volunteerStatusHistoryMock,
} from "../matchConfirmation/__mocks__";
import type { MSRPiiSec } from "@prisma/client";
import { replyMock, sendOpenReplyMock } from "../reply/__mocks__";

const callback = jest.fn();

const defaultBody = {
  matchConfirmationId: 1,
};

const expireMatchMock = jest.spyOn(expireMatch, "default");

const msrPIIMock = {
  email: "msr@gmail.com",
  firstName: "MSR",
} as MSRPiiSec;

describe("/expire endpoint", () => {
  it("should return an error res when no body is provided to the req", async () => {
    await expire(
      {
        body: null,
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: "Validation error: matchConfirmationId is a required field",
      }),
    });
  });

  it("should return an error res when req body is invalid", async () => {
    await expire(
      {
        body: JSON.stringify({
          supportRequestId: 1,
        }),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: `Validation error: matchConfirmationId is a required field`,
      }),
    });
  });

  it("should call expireMatch with correct params", async () => {
    await expire(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(expireMatchMock).toHaveBeenNthCalledWith(
      1,
      defaultBody.matchConfirmationId
    );
  });

  it("should return an error if match_confirmation wasn't found", async () => {
    prismaMock.matchConfirmations.findUnique.mockResolvedValueOnce(null);
    await expire(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: `Couldn't expire match confirmation for match_confirmation_id: ${defaultBody.matchConfirmationId}`,
      }),
    });
  });

  it("should return the match_confirmation", async () => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    prismaMock.mSRPiiSec.findUniqueOrThrow.mockResolvedValueOnce(msrPIIMock);
    prismaMock.matchConfirmations.findUnique.mockResolvedValueOnce(
      matchConfirmationMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValueOnce(
      supportRequestMock
    );
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValueOnce(
      volunteerMock
    );
    prismaMock.volunteerStatusHistory.findFirstOrThrow.mockResolvedValueOnce(
      volunteerStatusHistoryMock
    );
    sendOpenReplyMock.mockResolvedValue(replyMock);

    await expire(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: {
          matchConfirmationId: matchConfirmationMock.matchConfirmationId,
          status: "expired",
        },
      }),
    });
  });
});
