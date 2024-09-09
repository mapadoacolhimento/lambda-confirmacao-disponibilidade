import * as acceptMatch from "../../matchAccepted/acceptMatch";
import * as denyMatch from "../../matchDenied/denyMatch";
import * as matchConfirmationLogic from "../matchConfirmationLogic";
import { prismaMock } from "../../setupTests";
import type { ReplyType } from "../../types";
import {
  matchConfirmationMock,
  supportRequestMock,
  volunteerMock,
} from "../__mocks__";
import processMatchConfirmation from "../processMatchConfirmation";

const fetchSupportRequestAndVolunteerMock = jest.spyOn(
  matchConfirmationLogic,
  "fetchSupportRequestAndVolunteer"
);
const acceptMatchMock = jest
  .spyOn(acceptMatch, "default")
  .mockImplementation(() => Promise.resolve());
const denyMatchMock = jest
  .spyOn(denyMatch, "default")
  .mockImplementation(() => Promise.resolve());
const buttonTextMock = "Sim" as ReplyType.positive;

describe("processMatchConfirmation", () => {
  beforeEach(() => {
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValue(
      supportRequestMock
    );
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValue(volunteerMock);
    acceptMatchMock.mockResolvedValue();
    denyMatchMock.mockResolvedValue();
  });

  it("should call fetchSupportRequestAndVolunteer with correct params", async () => {
    await processMatchConfirmation(matchConfirmationMock, buttonTextMock);

    expect(fetchSupportRequestAndVolunteerMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId,
      matchConfirmationMock.volunteerId
    );
  });

  describe("accept match when volunteer answered positively", () => {
    it("should call acceptMatch with correct params", async () => {
      await processMatchConfirmation(
        matchConfirmationMock,
        "Sim" as ReplyType.positive
      );

      expect(acceptMatchMock).toHaveBeenNthCalledWith(
        1,
        matchConfirmationMock,
        supportRequestMock,
        volunteerMock
      );
    });

    it("should return the match_confirmation", async () => {
      const res = await processMatchConfirmation(
        matchConfirmationMock,
        "Sim" as ReplyType.positive
      );

      expect(res).toStrictEqual(matchConfirmationMock);
    });
  });

  describe("deny match when volunteer answered negatively", () => {
    it("should call denyMatch with correct params", async () => {
      await processMatchConfirmation(
        matchConfirmationMock,
        "Não" as ReplyType.negative
      );

      expect(denyMatchMock).toHaveBeenNthCalledWith(
        1,
        matchConfirmationMock,
        supportRequestMock,
        volunteerMock
      );
    });

    it("should return the match_confirmation", async () => {
      const res = await processMatchConfirmation(
        matchConfirmationMock,
        "Não" as ReplyType.negative
      );

      expect(res).toStrictEqual(matchConfirmationMock);
    });
  });
});
