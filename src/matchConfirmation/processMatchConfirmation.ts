import acceptMatch from "../matchAccepted/acceptMatch";
import { ButtonText } from "../types";

export default async function processMatchConfirmation(
  buttonText: ButtonText,
  buttonPayload: string
) {
  const shouldAcceptMatch =
    !!buttonPayload && buttonText === ButtonText.positive;
  if (shouldAcceptMatch) await acceptMatch(buttonPayload);
}
