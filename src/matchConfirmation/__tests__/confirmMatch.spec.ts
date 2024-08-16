import * as confirmationLogic from "../matchConfirmationLogic";
import confirmMatch from "../confirmMatch";
import { prismaMock } from "../../setupTests";
import {
  createMessageMock,
  matchConfirmationMock,
  matchInfoMock,
  msrPIIMock,
  msrZendeskTicketMock,
  sentMessageMock,
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

const sendWhatsAppMessageMock = jest.spyOn(
  confirmationLogic,
  "sendWhatsAppMessage"
);

describe("confirmMatch", () => {
  describe("successful res", () => {
    it("should call sendWhatsAppMessage with correct params", async () => {
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
      await confirmMatch(
        supportRequestMock,
        msrPIIMock,
        volunteerMock,
        matchInfoMock
      );

      expect(sendWhatsAppMessageMock).toHaveBeenNthCalledWith(
        1,
        volunteerMock,
        supportRequestMock
      );
    });

    it("should call updateMsrZendeskTicketMock with correct params", async () => {
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
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
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
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
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
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
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
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
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
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
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
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
      createMessageMock.mockResolvedValueOnce(sentMessageMock);
      updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
      prismaMock.supportRequests.update.mockResolvedValue(supportRequestMock);
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
