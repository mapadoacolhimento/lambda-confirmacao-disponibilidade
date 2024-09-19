import * as sendOpenReply from "../../twilioClient/sendOpenReply";
import * as sendTemplateMessage from "../../twilioClient/sendTemplateMessage";

export const sendOpenReplyMock = jest
  .spyOn(sendOpenReply, "default")
  .mockImplementation(() => Promise.resolve(null));

export const sendTemplateMessageMock = jest
  .spyOn(sendTemplateMessage, "default")
  .mockImplementation(() => Promise.resolve(null));

export const replyMock = "accepted";

export const volunteerPhoneMock = "11123456789";
