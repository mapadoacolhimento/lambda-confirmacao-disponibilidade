import * as cleanPhone from "../../utils/cleanPhone";
import sendReply from "../sendReply";
import {
  replyMock,
  sendOpenReplyMock,
  sendTemplateMessageMock,
  volunteerPhoneMock,
} from "../__mocks__";
import * as replyLogic from "../replyLogic";

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
    await sendReply("button", volunteerFrom, "Sim");

    expect(cleanPhoneMock).toHaveBeenNthCalledWith(1, volunteerFrom);
  });

  it("should call sendPositiveReply with correct params", async () => {
    await sendReply("button", volunteerFrom, "Sim");

    expect(sendPositiveReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendNegativeReply with correct params", async () => {
    await sendReply("button", volunteerFrom, "Não");

    expect(sendNegativeReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendContinueAvailableReply with correct params", async () => {
    await sendReply("interactive", volunteerFrom, "É+um+caso+pontual");

    expect(sendContinueAvailableReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendUnregistrationReply with correct params", async () => {
    await sendReply("interactive", volunteerFrom, "Quero+descadastrar");

    expect(sendUnregistrationReplyMock).toHaveBeenNthCalledWith(
      1,
      volunteerPhoneMock
    );
  });

  it("should call sendGenericReply with correct params", async () => {
    await sendReply("text", volunteerFrom, "Oi");

    expect(sendGenericReplyMock).toHaveBeenNthCalledWith(1, volunteerPhoneMock);
  });

  it("should return null if the reply wasn't sent", async () => {
    sendOpenReplyMock.mockResolvedValue(null);
    const res = await sendReply("text", volunteerFrom, "Oi");

    expect(res).toStrictEqual(null);
  });

  it("should return the reply that was sent", async () => {
    const res = await sendReply("text", volunteerFrom, "Oi");

    expect(res).toStrictEqual(replyMock);
  });
});
