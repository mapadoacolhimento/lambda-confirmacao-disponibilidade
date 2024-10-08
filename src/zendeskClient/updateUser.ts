import("isomorphic-fetch");

import { getErrorMessage, stringfyBigInt } from "../utils";
import {
  ZENDESK_API_TOKEN,
  ZENDESK_API_URL,
  ZENDESK_API_USER,
} from "../constants";
import type { UpdateZendeskUser, ZendeskUser } from "../types";

export default async function updateUser(
  user: UpdateZendeskUser
): Promise<ZendeskUser | null> {
  try {
    const endpoint = ZENDESK_API_URL + "/users/" + user.id.toString() + ".json";

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        user: stringfyBigInt(user),
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

    return data["user"] as ZendeskUser;
  } catch (e) {
    console.error(
      `[updateUser] - Something went wrong when updating this user on Zendesk '${
        user.id
      }': ${getErrorMessage(e)}`
    );
    return null;
  }
}
