import sendReply from "../sendReply";
import {
  replyMock,
  sendOpenReplyMock,
  sendTemplateMessageMock,
  volunteerPhoneMock,
} from "../__mocks__";
import * as replyLogic from "../replyLogic";
import { ReplyType } from "../../types";

const phone = "11123456789";

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

const sendErrorReplyMock = jest.spyOn(replyLogic, "sendErrorReply");

describe("sendReply", () => {
  beforeEach(() => {
    sendOpenReplyMock.mockResolvedValue(replyMock);
    sendTemplateMessageMock.mockResolvedValue(replyMock);
  });

  it("should call sendPositiveReply with correct params", async () => {
    await sendReply(phone, ReplyType.positive);

    expect(sendPositiveReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendNegativeReply with correct params", async () => {
    await sendReply(phone, ReplyType.negative);

    expect(sendNegativeReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendContinueAvailableReply with correct params", async () => {
    await sendReply(phone, ReplyType.continue);

    expect(sendContinueAvailableReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendUnregistrationReply with correct params", async () => {
    await sendReply(phone, ReplyType.unregistration);

    expect(sendUnregistrationReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendGenericReply with correct params", async () => {
    await sendReply(phone, undefined);

    expect(sendGenericReplyMock).toHaveBeenNthCalledWith(1, volunteerPhoneMock);
  });

  it("should call sendErrorReply with correct params", async () => {
    await sendReply(phone, ReplyType.error);

    expect(sendErrorReplyMock).toHaveBeenNthCalledWith(1, volunteerPhoneMock);
  });

  it("should return the reply that was sent", async () => {
    const res = await sendReply(phone, undefined);

    expect(res).toStrictEqual(replyMock);
  });
});
