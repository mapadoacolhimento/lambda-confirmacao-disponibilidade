import type { TwilioMessage } from "../../types";
import {
  WHATSAPP_CONTINUE_AVAILABLE_REPLY,
  WHATSAPP_GENERIC_REPLY,
  WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID,
  WHATSAPP_POSITIVE_REPLY,
  WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID,
} from "../../constants";
import * as sendOpenReply from "../../twilioClient/sendOpenReply";
import * as sendTemplateMessage from "../../twilioClient/sendTemplateMessage";
import {
  sendContinueAvailableReply,
  sendGenericReply,
  sendNegativeReply,
  sendPositiveReply,
  sendUnregistrationReply,
} from "../sendReply";

const volunteerPhoneMock = "5511123456789";

const replyMock = {
  status: "accepted",
} as TwilioMessage;

const sendOpenReplyMock = jest
  .spyOn(sendOpenReply, "default")
  .mockImplementation(() => Promise.resolve(null));

const sendTemplateMessageMock = jest
  .spyOn(sendTemplateMessage, "default")
  .mockImplementation(() => Promise.resolve(null));

describe("sendReply functions", () => {
  beforeEach(() => {
    sendOpenReplyMock.mockResolvedValue(replyMock);
    sendTemplateMessageMock.mockResolvedValue(replyMock);
  });

  describe("sendGenericReply", () => {
    it("should call sendOpenReply with correct params", async () => {
      await sendGenericReply(volunteerPhoneMock);

      expect(sendOpenReplyMock).toHaveBeenNthCalledWith(
        1,
        WHATSAPP_GENERIC_REPLY,
        volunteerPhoneMock
      );
    });

    it("should return the reply that was sent", async () => {
      const res = await sendGenericReply(volunteerPhoneMock);

      expect(res).toStrictEqual(replyMock);
    });
  });

  describe("sendPositiveReply", () => {
    it("should call sendOpenReply with correct params", async () => {
      await sendPositiveReply(volunteerPhoneMock);

      expect(sendOpenReplyMock).toHaveBeenNthCalledWith(
        1,
        WHATSAPP_POSITIVE_REPLY,
        volunteerPhoneMock
      );
    });

    it("should return the reply that was sent", async () => {
      const res = await sendPositiveReply(volunteerPhoneMock);

      expect(res).toStrictEqual(replyMock);
    });
  });

  describe("sendNegativeReply", () => {
    it("should call sendTemplateMessag with correct params", async () => {
      await sendNegativeReply(volunteerPhoneMock);

      expect(sendTemplateMessageMock).toHaveBeenNthCalledWith(
        1,
        WHATSAPP_NEGATIVE_REPLY_TEMPLATE_ID,
        volunteerPhoneMock,
        {}
      );
    });

    it("should return the reply that was sent", async () => {
      const res = await sendNegativeReply(volunteerPhoneMock);

      expect(res).toStrictEqual(replyMock);
    });
  });

  describe("sendContinueAvailableReply", () => {
    it("should call sendOpenReply with correct params", async () => {
      await sendContinueAvailableReply(volunteerPhoneMock);

      expect(sendOpenReplyMock).toHaveBeenNthCalledWith(
        1,
        WHATSAPP_CONTINUE_AVAILABLE_REPLY,
        volunteerPhoneMock
      );
    });

    it("should return the reply that was sent", async () => {
      const res = await sendContinueAvailableReply(volunteerPhoneMock);

      expect(res).toStrictEqual(replyMock);
    });
  });

  describe("sendUnregistrationReply", () => {
    it("should call sendTemplateMessag with correct params", async () => {
      await sendUnregistrationReply(volunteerPhoneMock);

      expect(sendTemplateMessageMock).toHaveBeenNthCalledWith(
        1,
        WHATSAPP_UNREGISTRATION_REPLY_TEMPLATE_ID,
        volunteerPhoneMock,
        {}
      );
    });

    it("should return the reply that was sent", async () => {
      const res = await sendUnregistrationReply(volunteerPhoneMock);

      expect(res).toStrictEqual(replyMock);
    });
  });
});
