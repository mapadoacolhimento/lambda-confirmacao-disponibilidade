import("isomorphic-fetch");

import { getErrorMessage, stringfyBigInt } from "../utils";
import {
  ZENDESK_API_TOKEN,
  ZENDESK_API_URL,
  ZENDESK_API_USER,
} from "../constants";
import type { UpdateZendeskTicket, ZendeskTicket } from "../types";

export default async function updateTicket(
  ticket: UpdateZendeskTicket
): Promise<ZendeskTicket | null> {
  try {
    const endpoint =
      ZENDESK_API_URL + "/tickets/" + ticket.id.toString() + ".json";

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        ticket: stringfyBigInt(ticket),
      }),
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${ZENDESK_API_USER}:${ZENDESK_API_TOKEN}`).toString(
            "base64"
          ),
      },
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (data["error"] && response.status !== 200) {
      throw new Error(getErrorMessage(data));
    }

    return data["ticket"] as ZendeskTicket;
  } catch (e) {
    console.error(
      `[updateTicket] - Something went wrong when updating this ticket '${
        ticket.id
      }': ${getErrorMessage(e)}`
    );
    return null;
  }
}
