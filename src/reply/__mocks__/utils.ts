import * as sendOpenReply from "../../twilioClient/sendOpenReply";
import * as sendTemplateMessage from "../../twilioClient/sendTemplateMessage";
import type { TwilioMessage } from "../../types";

export const sendOpenReplyMock = jest
  .spyOn(sendOpenReply, "default")
  .mockImplementation(() => Promise.resolve(null));

export const sendTemplateMessageMock = jest
  .spyOn(sendTemplateMessage, "default")
  .mockImplementation(() => Promise.resolve(null));

export const replyMock = {
  status: "accepted",
} as TwilioMessage;

export const volunteerPhoneMock = "5511123456789";
