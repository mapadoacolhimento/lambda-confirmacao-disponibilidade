import * as confirmationLogic from "../matchConfirmationLogic";
import confirmMatch from "../confirmMatch";
import { prismaMock } from "../../setupTests";
import {
  matchConfirmationMock,
  matchInfoMock,
  msrPIIMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerMock,
} from "../__mocks__";

const createMatchConfimationMock = jest.spyOn(
  confirmationLogic,
  "createMatchConfirmation"
);

const updateSupportRequestMock = jest.spyOn(
  confirmationLogic,
  "updateSupportRequest"
);

const makeVolunteerUnavailableMock = jest.spyOn(
  confirmationLogic,
  "makeVolunteerUnavailable"
);

const updateMsrZendeskTicketMock = jest
  .spyOn(confirmationLogic, "updateMsrZendeskTicket")
  .mockImplementation(() => Promise.resolve(msrZendeskTicketMock));

describe("confirmMatch", () => {
  describe("successful res", () => {
    it("should call updateMsrZendeskTicketMock with correct params", async () => {
      await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(updateMsrZendeskTicketMock).toHaveBeenNthCalledWith(
        1,
        supportRequestMock.zendeskTicketId,
        volunteerMock
      );
    });

    it("should call updateSupportRequest with correct params", async () => {
      updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);

      await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(updateSupportRequestMock).toHaveBeenNthCalledWith(
        1,
        supportRequestMock.supportRequestId
      );
    });

    it("should call makeVolunteerUnavailable with correct params", async () => {
      updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
      prismaMock.supportRequests.update.mockResolvedValue(supportRequestMock);
      updateUserMock.mockResolvedValueOnce(updatedUserMock);

      await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(makeVolunteerUnavailableMock).toHaveBeenNthCalledWith(
        1,
        volunteerMock
      );
    });

    it("should call createMatchConfirmation with correct params", async () => {
      updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
      prismaMock.supportRequests.update.mockResolvedValue(supportRequestMock);
      updateUserMock.mockResolvedValueOnce(updatedUserMock);
      makeVolunteerUnavailableMock.mockResolvedValueOnce(volunteerMock);

      await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(createMatchConfimationMock).toHaveBeenNthCalledWith(
        1,
        supportRequestMock.supportRequestId,
        msrPIIMock.msrId,
        volunteerMock.id,
        matchInfoMock
      );
    });

    it("should return the match_confirmation", async () => {
      updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
      prismaMock.matchConfirmations.create.mockResolvedValue(
        matchConfirmationMock
      );
      prismaMock.supportRequests.update.mockResolvedValue(supportRequestMock);
      updateUserMock.mockResolvedValueOnce(updatedUserMock);
      makeVolunteerUnavailableMock.mockResolvedValueOnce(volunteerMock);

      const res = await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(res).toStrictEqual(matchConfirmationMock);
    });
  });

  describe("unsuccessful res", () => {
    it("should return null if no ticket was updated on Zendesk", async () => {
      updateTicketMock.mockResolvedValueOnce(null);

      const res = await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(res).toStrictEqual(null);
    });

    it("should return null if no volunteer was updated on Zendesk", async () => {
      updateUserMock.mockResolvedValueOnce(null);

      const res = await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(res).toStrictEqual(null);
    });
  });
});
