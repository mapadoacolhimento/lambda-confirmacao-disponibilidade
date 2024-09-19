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
import { prismaMock } from "../../setupTests";
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

describe("expireMatch", () => {
  beforeEach(() => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
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

  it("should return the matchConfirmation", async () => {
    const res = await expireMatch(matchConfirmationMock.matchConfirmationId);

    expect(res).toStrictEqual(matchConfirmationMock);
  });
});
