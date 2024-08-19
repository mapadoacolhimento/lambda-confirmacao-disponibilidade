export const ZENDESK_SUBDOMAIN = process.env["ZENDESK_SUBDOMAIN"];
export const ZENDESK_API_URL = `${ZENDESK_SUBDOMAIN}/api/v2`;
export const ZENDESK_API_USER = `${process.env["ZENDESK_API_USER"]}/token`;
export const ZENDESK_API_TOKEN = process.env["ZENDESK_API_TOKEN"];

export const ZENDESK_CUSTOM_FIELDS_DICIO = {
  status_acolhimento: 360014379412,
};

export const ZENDESK_TICKET_WAITING_FOR_CONFIRMATION_STATUS =
  "encaminhamento__aguardando_confirmação";
export const ZENDESK_USER_WAITING_FOR_CONFIRMATION_STATUS =
  "indisponivel_aguardando_confirmacao";

export const TWILIO_ACCOUNT_SID = process.env["TWILIO_ACCOUNT_SID"];
export const TWILIO_AUTH_TOKEN = process.env["TWILIO_AUTH_TOKEN"];

export const WHATSAPP_TEMPLATE_WITH_CITY_ID =
  "HX77fce501ec6df2b537d23eee89f330d7";
export const WHATSAPP_TEMPLATE_WITHOUT_CITY_ID =
  "HX08285d533e24c762d17ec62b96fdf409";
export const WHATSAPP_SENDER_ID = "MG079062f161fcf64622214b97dfe44e3c";
