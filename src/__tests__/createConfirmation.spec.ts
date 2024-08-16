import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import { createConfirmation } from "../../handler";
import { prismaMock } from "../setupTests";
import {
  matchConfirmationMock,
  matchInfoMock,
  msrPIIMock,
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
        error: "Empty request body",
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
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(null);
    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: `Volunteer not found for volunteer_id '1'`,
      }),
    });
  });

  it("should return an error if volunteer doesn't have phone information", async () => {
    prismaMock.volunteers.findUnique.mockResolvedValueOnce({
      ...volunteerMock,
      phone: "not_found",
    });

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: `Volunteer without phone information: volunteer_id '1'`,
      }),
    });
  });

  it("should return an error if support_request wasn't found", async () => {
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUnique.mockResolvedValueOnce(null);

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: `support_request not found for support_request_id '1'`,
      }),
    });
  });

  it("should return an error if msr_pii wasn't found", async () => {
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUnique.mockResolvedValueOnce(
      supportRequestMock
    );
    prismaMock.mSRPiiSec.findUnique.mockResolvedValueOnce(null);

    await createConfirmation(
      {
        body: JSON.stringify(defaultBody),
      } as APIGatewayProxyEvent,
      {} as Context,
      callback
    );
    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: `MSR not found for msr_id '12345'`,
      }),
    });
  });

  it("should call confirmMatch with correct params", async () => {
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUnique.mockResolvedValueOnce(
      supportRequestMock
    );
    prismaMock.mSRPiiSec.findUnique.mockResolvedValueOnce(msrPIIMock);

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
      msrPIIMock,
      volunteerWithPhoneMock,
      matchInfoMock
    );
  });

  it("should return an error if the match confirmation wasn't correctly created", async () => {
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUnique.mockResolvedValueOnce(
      supportRequestMock
    );
    prismaMock.mSRPiiSec.findUnique.mockResolvedValueOnce(msrPIIMock);
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
    prismaMock.volunteers.findUnique.mockResolvedValueOnce(
      volunteerWithPhoneMock
    );
    prismaMock.supportRequests.findUnique.mockResolvedValueOnce(
      supportRequestMock
    );
    prismaMock.mSRPiiSec.findUnique.mockResolvedValueOnce(msrPIIMock);
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
