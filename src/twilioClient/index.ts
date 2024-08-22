import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../constants";

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default twilioClient;

export { default as sendOpenReply } from "./sendOpenReply";
export { default as sendTemplateMessage } from "./sendTemplateMessage";
