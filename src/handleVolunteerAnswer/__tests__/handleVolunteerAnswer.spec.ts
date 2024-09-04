import handleVolunteerAnswer from "../handleVolunteerAnswer";
import { ReplyType } from "../../types";
import { prismaMock } from "../../setupTests";
import {
  matchConfirmationMock,
  supportRequestMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import { replyMock } from "../../reply/__mocks__";
import * as confirmationLogic from "../../matchConfirmation/matchConfirmationLogic";
import * as utils from "../../utils";
import * as sendReply from "../../reply/sendReply";
import * as processMatchConfirmation from "../../matchConfirmation/processMatchConfirmation";

const volunteerFrom = "whatsapp%3A%2B5511123456789";
const buttonTextMock = "Sim" as ReplyType;
const buttonPayloadMock = "yes_12345";

const getMatchConfirmationIdMock = jest.spyOn(
  confirmationLogic,
  "getMatchConfirmationId"
);
const fetchMatchConfirmationMock = jest.spyOn(
  confirmationLogic,
  "fetchMatchConfirmation"
);
const cleanPhoneMock = jest.spyOn(utils, "cleanPhone");
const sendReplyMock = jest.spyOn(sendReply, "default");
const processMatchConfirmationMock = jest
  .spyOn(processMatchConfirmation, "default")
  .mockImplementation(() => Promise.resolve(matchConfirmationMock));

describe("handleVolunteerAnswer", () => {
  beforeEach(() => {
    sendReplyMock.mockResolvedValueOnce(replyMock);
    prismaMock.matchConfirmations.findUnique.mockResolvedValue(
      matchConfirmationMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValue(
      supportRequestMock
    );
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValue(volunteerMock);
    processMatchConfirmationMock.mockResolvedValue(matchConfirmationMock);
  });

  it("should call cleanPhone with correct params", async () => {
    await handleVolunteerAnswer(
      volunteerFrom,
      buttonTextMock,
      buttonPayloadMock
    );

    expect(cleanPhoneMock).toHaveBeenNthCalledWith(1, volunteerFrom);
  });

  describe("when it doesn't need to process the match confirmation", () => {
    it("should call sendReply with correct params", async () => {
      await handleVolunteerAnswer(
        volunteerFrom,
        ReplyType.unregistration,
        undefined
      );

      expect(sendReplyMock).toHaveBeenNthCalledWith(
        1,
        "5511123456789",
        ReplyType.unregistration
      );
    });
  });

  describe("when it needs to process the match confirmation", () => {
    it("should call getMatchConfirmationId with correct params", async () => {
      await handleVolunteerAnswer(
        volunteerFrom,
        buttonTextMock,
        buttonPayloadMock
      );

      expect(getMatchConfirmationIdMock).toHaveBeenNthCalledWith(
        1,
        buttonPayloadMock
      );
    });

    it("should call fetchMatchConfirmation with correct params", async () => {
      await handleVolunteerAnswer(
        volunteerFrom,
        buttonTextMock,
        buttonPayloadMock
      );

      expect(fetchMatchConfirmationMock).toHaveBeenNthCalledWith(1, 12345);
    });

    it("should call sendReply with correct params when matchConfirmation was not found", async () => {
      prismaMock.matchConfirmations.findUnique.mockResolvedValue(null);
      await handleVolunteerAnswer(
        volunteerFrom,
        buttonTextMock,
        buttonPayloadMock
      );

      expect(sendReplyMock).toHaveBeenNthCalledWith(
        1,
        "5511123456789",
        ReplyType.error
      );
    });

    it("should call sendReply with correct params when matchConfirmation was found", async () => {
      await handleVolunteerAnswer(
        volunteerFrom,
        buttonTextMock,
        buttonPayloadMock
      );

      expect(sendReplyMock).toHaveBeenNthCalledWith(
        1,
        "5511123456789",
        ReplyType.positive
      );
    });

    it("should call processMatchConfirmation with correct params", async () => {
      await handleVolunteerAnswer(
        volunteerFrom,
        buttonTextMock,
        buttonPayloadMock
      );

      expect(processMatchConfirmationMock).toHaveBeenNthCalledWith(
        1,
        matchConfirmationMock,
        ReplyType.positive
      );
    });
  });
});
