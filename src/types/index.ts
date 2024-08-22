import {
  CONTINUE_AVAILABLE_ANSWER,
  NEGATIVE_ANSWER,
  POSITIVE_ANSWER,
  UNREGISTRATION_ANSWER,
} from "../constants";

export * from "./Zendesk";
export * from "./Twilio";

export enum ButtonText {
  positive = POSITIVE_ANSWER,
  negative = NEGATIVE_ANSWER,
  unregistration = UNREGISTRATION_ANSWER,
  continue = CONTINUE_AVAILABLE_ANSWER,
}
