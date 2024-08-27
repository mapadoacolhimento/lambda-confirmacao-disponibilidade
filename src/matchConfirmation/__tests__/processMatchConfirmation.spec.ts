import {
  authenticateMatchMock,
  createMatchMock,
  matchMock,
} from "../../matchAccepted/__mocks__";
import * as acceptMatch from "../../matchAccepted/acceptMatch";
import * as matchConfirmationLogic from "../matchConfirmationLogic";
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

const getMatchConfirmationIdMock = jest.spyOn(
  matchConfirmationLogic,
  "getMatchConfirmationId"
);
const fetchMatchConfirmationMock = jest.spyOn(
  matchConfirmationLogic,
  "fetchMatchConfirmation"
);
const fetchSupportRequestAndVolunteerMock = jest.spyOn(
  matchConfirmationLogic,
  "fetchSupportRequestAndVolunteer"
);
const acceptMatchMock = jest.spyOn(acceptMatch, "default");

const buttonTextMock = "Sim" as ButtonText;
const buttonPayloadMock = "yes_12345";

describe("processMatchConfirmation", () => {
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
  it("should call getMatchConfirmationId with correct params", async () => {
    await processMatchConfirmation(buttonTextMock, buttonPayloadMock);

    expect(getMatchConfirmationIdMock).toHaveBeenNthCalledWith(
      1,
      buttonPayloadMock
    );
  });

  it("should call fetchMatchConfirmation with correct params", async () => {
    await processMatchConfirmation(buttonTextMock, buttonPayloadMock);

    expect(fetchMatchConfirmationMock).toHaveBeenNthCalledWith(1, 12345);
  });

  it("should call fetchSupportRequestAndVolunteer with correct params", async () => {
    await processMatchConfirmation(buttonTextMock, buttonPayloadMock);

    expect(fetchSupportRequestAndVolunteerMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId,
      matchConfirmationMock.volunteerId
    );
  });

  describe("accept match when volunteer answered positively", () => {
    it("should call acceptMatch with correct params", async () => {
      await processMatchConfirmation(buttonTextMock, buttonPayloadMock);

      expect(acceptMatchMock).toHaveBeenNthCalledWith(
        1,
        matchConfirmationMock,
        supportRequestMock,
        volunteerMock
      );
    });
  });
});
