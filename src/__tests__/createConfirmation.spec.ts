import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import { createConfirmation } from "../../handler";
import { prismaMock } from "../setupTests";
import {
  matchConfirmationMock,
  matchInfoMock,
  supportRequestMock,
  volunteerMock,
} from "../matchConfirmation/__mocks__";
import * as confirmMatch from "../matchConfirmation/confirmMatch";

const callback = jest.fn();

const defaultBody = {
  supportRequestId: 1,
  volunteerId: 1,
  matchType: "daily",
  matchStage: "ideal",
};

const confirmMatchMock = jest.spyOn(confirmMatch, "default");

const volunteerWithPhoneMock = {
  ...volunteerMock,
  phone: "5511123456789",
};

describe("/create-confitmation endpoint", () => {
  it("should return an error res when no body is provided to the req", async () => {
    await createConfirmation(
      {
        body: null,
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: "Validation error: matchStage is a required field",
      }),
    });
  });

  it("should return an error res when req body is invalid", async () => {
    await createConfirmation(
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
        error: `Validation error: matchStage is a required field`,
      }),
    });
  });

  it("should return an error if volunteer wasn't found", async () => {
    prismaMock.volunteers.findUniqueOrThrow.mockRejectedValueOnce(
      new Error("volunteer not found")
    );
    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: `volunteer not found`,
      }),
    });
  });

  it("should return an error if support_request wasn't found", async () => {
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockRejectedValueOnce(
      new Error("support_request not found")
    );

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: `support_request not found`,
      }),
    });
  });

  it("should call confirmMatch with correct params", async () => {
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValueOnce(
      supportRequestMock
    );

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(confirmMatchMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock,
      volunteerWithPhoneMock,
      matchInfoMock
    );
  });

  it("should return an error if the match confirmation wasn't correctly created", async () => {
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValueOnce(
      supportRequestMock
    );
    confirmMatchMock.mockResolvedValueOnce(null);

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: `Couldn't create match confirmation`,
      }),
    });
  });

  it("should return the match_confirmation", async () => {
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValueOnce(
      supportRequestMock
    );
    confirmMatchMock.mockResolvedValueOnce(matchConfirmationMock);

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      body: JSON.stringify({ message: matchConfirmationMock }),
    });
  });
});
