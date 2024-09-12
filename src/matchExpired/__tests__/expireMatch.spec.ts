import expireMatch from "../expireMatch";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import * as matchConfirmationLogic from "../../matchConfirmation/matchConfirmationLogic";
import * as matchExpiredLogic from "../matchExpiredLogic";
import * as matchDeniedLogic from "../../matchDenied/matchDeniedLogic";
import * as replyLogic from "../../reply/replyLogic";
import * as emailClient from "../../emailClient/index";
import { prismaMock } from "../../setupTests";
import type { MSRPiiSec } from "@prisma/client";
import { replyMock, sendOpenReplyMock } from "../../reply/__mocks__";

const fetchMatchConfirmationMock = jest.spyOn(
  matchConfirmationLogic,
  "fetchMatchConfirmation"
);

const fetchSupportRequestAndVolunteerMock = jest.spyOn(
  matchConfirmationLogic,
  "fetchSupportRequestAndVolunteer"
);

const updateTicketWithExpirationMock = jest.spyOn(
  matchExpiredLogic,
  "updateTicketWithExpiration"
);

const expireMatchConfirmationMock = jest.spyOn(
  matchExpiredLogic,
  "expireMatchConfirmation"
);

const addSupportRequestToQueueMock = jest.spyOn(
  matchDeniedLogic,
  "addSupportRequestToQueue"
);

const makeVolunteerAvailableMock = jest.spyOn(
  matchDeniedLogic,
  "makeVolunteerAvailable"
);

const sendExpirationReplyMock = jest.spyOn(replyLogic, "sendExpirationReply");

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

describe("expireMatch", () => {
  beforeEach(() => {
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
    sendOpenReplyMock.mockResolvedValue(replyMock);
  });

  it("should call fetchMatchConfirmation with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(fetchMatchConfirmationMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.matchConfirmationId
    );
  });

  it("should return null if no match_confirmation was found", async () => {
    fetchMatchConfirmationMock.mockResolvedValueOnce(null);
    const res = await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(res).toStrictEqual(null);
  });

  it("should call fetchSupportRequestAndVolunteer with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(fetchSupportRequestAndVolunteerMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId,
      matchConfirmationMock.volunteerId
    );
  });

  it("should call updateTicketWithExpiration with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(updateTicketWithExpirationMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );
  });

  it("should call expireMatchConfirmation with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(expireMatchConfirmationMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.matchConfirmationId
    );
  });

  it("should call addSupportRequestToQueue with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(addSupportRequestToQueueMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId
    );
  });

  it("should call makeVolunteerAvailable with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(makeVolunteerAvailableMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock
    );
  });

  it("should call sendExpirationReplyMock with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(sendExpirationReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock.phone
    );
  });

  it("should call checkPreviousMatchConfirmations with correct params", async () => {
    await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(checkPreviousMatchConfirmationsMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock
    );
  });

  it("should return the matchConfirmation", async () => {
    const res = await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(res).toStrictEqual(matchConfirmationMock);
  });

  describe("should send email to MSR if she doesn't have previous match confirmations", () => {
    it("should call fetchMsrPii with correct params", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(false);
      await expireMatch(matchConfirmationMock.matchConfirmationId);

      expect(fetchMsrPiiMock).toHaveBeenNthCalledWith(
        1,
        matchConfirmationMock.msrId
      );
    });

    it("should call sendEmailToMsr with correct params", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(false);
      await expireMatch(matchConfirmationMock.matchConfirmationId);

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
      await expireMatch(matchConfirmationMock.matchConfirmationId);

      expect(fetchMsrPiiMock).toHaveBeenCalledTimes(0);
    });

    it("should not call sendEmailToMsr with correct params", async () => {
      checkPreviousMatchConfirmationsMock.mockResolvedValueOnce(true);
      await expireMatch(matchConfirmationMock.matchConfirmationId);

      expect(sendEmailToMsrMock).toHaveBeenCalledTimes(0);
    });
  });
});
