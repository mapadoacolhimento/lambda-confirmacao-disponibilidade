import * as matchDeniedLogic from "../matchDeniedLogic";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import denyMatch from "../denyMatch";
import { prismaMock } from "../../setupTests";
import type { MSRPiiSec } from "@prisma/client";
import * as emailClient from "../../emailClient";

const updateTicketWithDenialMock = jest.spyOn(
  matchDeniedLogic,
  "updateTicketWithDenial"
);
const denyMatchConfirmationMock = jest.spyOn(
  matchDeniedLogic,
  "denyMatchConfirmation"
);
const addSupportRequestToQueueMock = jest.spyOn(
  matchDeniedLogic,
  "addSupportRequestToQueue"
);

const makeVolunteerAvailableMock = jest.spyOn(
  matchDeniedLogic,
  "makeVolunteerAvailable"
);

const checkPreviousMatchConfirmationsMock = jest.spyOn(
  matchDeniedLogic,
  "checkPreviousMatchConfirmations"
);

const fetchMsrPiiMock = jest.spyOn(matchDeniedLogic, "fetchMsrPii");

const sendEmailToMsrMock = jest
  .spyOn(emailClient, "sendEmailToMsr")
  .mockImplementation(() => Promise.resolve(true));

const msrPIIMock = {
  email: "msr@gmail.com",
  firstName: "MSR",
} as MSRPiiSec;

describe("denyMatch", () => {
  beforeEach(() => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    prismaMock.mSRPiiSec.findUniqueOrThrow.mockResolvedValueOnce(msrPIIMock);
  });

  it("should call updateTicketWithDenial with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(updateTicketWithDenialMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );
  });

  it("should call denyMatchConfirmation with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(denyMatchConfirmationMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.matchConfirmationId
    );
  });

  it("should call addSupportRequestToQueue with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(addSupportRequestToQueueMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId
    );
  });

  it("should call makeVolunteerAvailable with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(makeVolunteerAvailableMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock
    );
  });

  it("should call checkPreviousMatchConfirmations with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(checkPreviousMatchConfirmationsMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId
    );
  });

  describe("should send email to MSR if she doesn't have previous match confirmations", () => {
    it("should call fetchMsrPii with correct params", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(false);
      await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

      expect(fetchMsrPiiMock).toHaveBeenNthCalledWith(
        1,
        matchConfirmationMock.msrId
      );
    });

    it("should call sendEmailToMsr with correct params", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(false);
      await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

      expect(sendEmailToMsrMock).toHaveBeenNthCalledWith(
        1,
        msrPIIMock,
        supportRequestMock
      );
    });
  });

  describe("should not send email to MSR if she has previous match confirmations", () => {
    it("should not call fetchMsrPii", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(true);
      await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

      expect(fetchMsrPiiMock).toHaveBeenCalledTimes(0);
    });

    it("should not call sendEmailToMsr with correct params", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(true);
      await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

      expect(sendEmailToMsrMock).toHaveBeenCalledTimes(0);
    });
  });
});
