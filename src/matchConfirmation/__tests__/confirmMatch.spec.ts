import * as confirmationLogic from "../matchConfirmationLogic";
import confirmMatch from "../confirmMatch";
import * as updateTicket from "../../zendeskClient/updateTicket";
import { prismaMock } from "../../setupTests";
import type {
  MatchStage,
  MatchType,
  MatchConfirmationStatus,
  Matches,
} from "@prisma/client";
import type { ZendeskTicket } from "../../types";

const createMatchConfimationMock = jest.spyOn(
  confirmationLogic,
  "createMatchConfirmation"
);

const updateMsrZendeskTicketMock = jest
  .spyOn(confirmationLogic, "updateMsrZendeskTicket")
  .mockImplementation(() => Promise.resolve(null));

const updateTicketMock = jest
  .spyOn(updateTicket, "default")
  .mockImplementation(() => Promise.resolve(null));

const supportRequest = {
  supportRequestId: 1,
  zendeskTicketId: 1000 as unknown as bigint,
};

const msrPII = {
  msrId: 12345 as unknown as bigint,
  email: "teste@msr.com",
  firstName: "teste",
  phone: "not_found",
  dateOfBirth: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const volunteer = {
  id: 2,
  firstName: "Voluntária",
  zendeskUserId: 10 as unknown as bigint,
};

const matchInfo = {
  matchType: "daily",
  matchStage: "ideal",
} as Pick<Matches, "matchType" | "matchStage">;

const matchConfirmation = {
  matchConfirmationId: 1,
  supportRequestId: 1,
  msrId: 12345 as unknown as bigint,
  volunteerId: 2,
  status: "waiting" as MatchConfirmationStatus,
  matchType: "daily" as MatchType,
  matchStage: "ideal" as MatchStage,
  matchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const updatedTicket = {
  id: 123412341234 as unknown as bigint,
} as ZendeskTicket;

describe("confirmMatch", () => {
  describe("unsuccessful res", () => {
    updateTicketMock.mockResolvedValueOnce(null);
    updateMsrZendeskTicketMock.mockResolvedValueOnce(null);

    it("should return null if the ticket wasn't updated", async () => {
      const res = await confirmMatch(
        supportRequest,
        msrPII,
        volunteer,
        matchInfo
      );

      expect(res).toStrictEqual(null);
    });
  });

  describe("successful res", () => {
    it("should call updateMsrZendeskTicketMock with correct params", async () => {
      await confirmMatch(supportRequest, msrPII, volunteer, matchInfo);

      expect(updateMsrZendeskTicketMock).toHaveBeenNthCalledWith(
        1,
        supportRequest.zendeskTicketId,
        volunteer
      );
    });

    it("should call createMatchConfirmation with correct params", async () => {
      updateTicketMock.mockResolvedValueOnce(updatedTicket);
      updateMsrZendeskTicketMock.mockResolvedValueOnce(updatedTicket);

      await confirmMatch(supportRequest, msrPII, volunteer, matchInfo);

      expect(createMatchConfimationMock).toHaveBeenNthCalledWith(
        1,
        supportRequest.supportRequestId,
        msrPII.msrId,
        volunteer.id,
        matchInfo
      );
    });

    it("should return the match_confirmation", async () => {
      updateTicketMock.mockResolvedValueOnce(updatedTicket);
      updateMsrZendeskTicketMock.mockResolvedValueOnce(updatedTicket);

      prismaMock.matchConfirmations.create.mockResolvedValue(matchConfirmation);

      const res = await confirmMatch(
        supportRequest,
        msrPII,
        volunteer,
        matchInfo
      );

      expect(res).toStrictEqual(matchConfirmation);
    });
  });
});
