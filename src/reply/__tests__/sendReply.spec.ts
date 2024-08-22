import * as cleanPhone from "../../utils/cleanPhone";
import sendReply from "../sendReply";
import {
  replyMock,
  sendOpenReplyMock,
  sendTemplateMessageMock,
  volunteerPhoneMock,
} from "../__mocks__";
import * as replyLogic from "../replyLogic";
import { ButtonText } from "../../types";

const volunteerFrom = "whatsapp%3A%2B5511123456789";

const cleanPhoneMock = jest.spyOn(cleanPhone, "default");

const sendPositiveReplyMock = jest.spyOn(replyLogic, "sendPositiveReply");

const sendNegativeReplyMock = jest.spyOn(replyLogic, "sendNegativeReply");

const sendContinueAvailableReplyMock = jest.spyOn(
  replyLogic,
  "sendContinueAvailableReply"
);

const sendUnregistrationReplyMock = jest.spyOn(
  replyLogic,
  "sendUnregistrationReply"
);

const sendGenericReplyMock = jest.spyOn(replyLogic, "sendGenericReply");

describe("sendReply", () => {
  beforeEach(() => {
    sendOpenReplyMock.mockResolvedValue(replyMock);
    sendTemplateMessageMock.mockResolvedValue(replyMock);
  });

  it("should call cleanPhone with correct params", async () => {
    await sendReply(volunteerFrom, ButtonText.positive);

    expect(cleanPhoneMock).toHaveBeenNthCalledWith(1, volunteerFrom);
  });

  it("should call sendPositiveReply with correct params", async () => {
    await sendReply(volunteerFrom, ButtonText.positive);

    expect(sendPositiveReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendNegativeReply with correct params", async () => {
    await sendReply(volunteerFrom, ButtonText.negative);

    expect(sendNegativeReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendContinueAvailableReply with correct params", async () => {
    await sendReply(volunteerFrom, ButtonText.continue);

    expect(sendContinueAvailableReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendUnregistrationReply with correct params", async () => {
    await sendReply(volunteerFrom, ButtonText.unregistration);

    expect(sendUnregistrationReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendGenericReply with correct params", async () => {
    await sendReply(volunteerFrom, undefined);

    expect(sendGenericReplyMock).toHaveBeenNthCalledWith(1, volunteerPhoneMock);
  });

  it("should return the reply that was sent", async () => {
    const res = await sendReply(volunteerFrom, undefined);

    expect(res).toStrictEqual(replyMock);
  });
});
