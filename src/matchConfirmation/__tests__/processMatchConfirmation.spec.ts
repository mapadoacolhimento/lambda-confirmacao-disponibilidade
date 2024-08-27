import {
  authenticateMatchMock,
  createMatchMock,
  matchMock,
} from "../../matchAccepted/__mocks__";
import * as acceptMatch from "../../matchAccepted/acceptMatch";
import { prismaMock } from "../../setupTests";
import type { ButtonText } from "../../types";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updateTicketMock,
  volunteerMock,
} from "../__mocks__";
import processMatchConfirmation from "../processMatchConfirmation";

const acceptMatchMock = jest.spyOn(acceptMatch, "default");

describe("processMatchConfirmation", () => {
  describe("accept match when volunteer answered positively", () => {
    const buttonTextMock = "Sim" as ButtonText;
    const buttonPayloadMock = "yes_12345";

    beforeEach(() => {
      prismaMock.matchConfirmations.findUniqueOrThrow.mockResolvedValue(
        matchConfirmationMock
      );
      prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValue(
        supportRequestMock
      );
      prismaMock.volunteers.findUniqueOrThrow.mockResolvedValue(volunteerMock);
      updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
      authenticateMatchMock.mockResolvedValueOnce("abc");
      createMatchMock.mockResolvedValueOnce(matchMock);
    });

    it("should call acceptMatch with correct params", async () => {
      await processMatchConfirmation(buttonTextMock, buttonPayloadMock);

      expect(acceptMatchMock).toHaveBeenNthCalledWith(1, buttonPayloadMock);
    });
  });
});
