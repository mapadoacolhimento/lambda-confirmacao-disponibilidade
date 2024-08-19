import * as confirmationLogic from "../matchConfirmationLogic";
import confirmMatch from "../confirmMatch";
import { prismaMock } from "../../setupTests";
import {
  matchConfirmationMock,
  matchInfoMock,
  msrZendeskTicketMock,
  sendTemplateMessageMock,
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
  beforeEach(() => {
    sendTemplateMessageMock.mockResolvedValueOnce(sentMessageMock);
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    prismaMock.supportRequests.update.mockResolvedValue(supportRequestMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    makeVolunteerUnavailableMock.mockResolvedValueOnce(volunteerMock);
  });

  it("should call sendWhatsAppMessage with correct params", async () => {
    await confirmMatch(supportRequestMock, volunteerMock, matchInfoMock);

    expect(sendWhatsAppMessageMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock,
      supportRequestMock
    );
  });

  it("should call updateMsrZendeskTicketMock with correct params", async () => {
    await confirmMatch(supportRequestMock, volunteerMock, matchInfoMock);

    expect(updateMsrZendeskTicketMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );
  });

  it("should call updateSupportRequest with correct params", async () => {
    await confirmMatch(supportRequestMock, volunteerMock, matchInfoMock);

    expect(updateSupportRequestMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.supportRequestId
    );
  });

  it("should call makeVolunteerUnavailable with correct params", async () => {
    await confirmMatch(supportRequestMock, volunteerMock, matchInfoMock);

    expect(makeVolunteerUnavailableMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock
    );
  });

  it("should call createMatchConfirmation with correct params", async () => {
    await confirmMatch(supportRequestMock, volunteerMock, matchInfoMock);

    expect(createMatchConfimationMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock,
      volunteerMock.id,
      matchInfoMock
    );
  });

  it("should return the match_confirmation", async () => {
    prismaMock.matchConfirmations.create.mockResolvedValue(
      matchConfirmationMock
    );

    const res = await confirmMatch(
      supportRequestMock,
      volunteerMock,
      matchInfoMock
    );

    expect(res).toStrictEqual(matchConfirmationMock);
  });
});
