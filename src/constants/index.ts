export const ZENDESK_SUBDOMAIN = process.env["ZENDESK_SUBDOMAIN"];
export const ZENDESK_API_URL = `${ZENDESK_SUBDOMAIN}/api/v2`;
export const ZENDESK_API_USER = `${process.env["ZENDESK_API_USER"]}/token`;
export const ZENDESK_API_TOKEN = process.env["ZENDESK_API_TOKEN"];

export const ZENDESK_CUSTOM_FIELDS_DICIO = {
  status_acolhimento: 360014379412,
};
