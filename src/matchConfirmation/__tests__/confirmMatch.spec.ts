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
const undeliveredMatchConfirmationMock = jest.spyOn(
  confirmationLogic,
  "undeliveredMatchConfirmation"
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
    prismaMock.matchConfirmations.create.mockResolvedValue(
      matchConfirmationMock
    );
  });

  it("should call sendWhatsAppMessage with correct params", async () => {
    await confirmMatch(supportRequestMock, volunteerMock, matchInfoMock);

    expect(sendWhatsAppMessageMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock,
      supportRequestMock,
      matchConfirmationMock.matchConfirmationId
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
    const res = await confirmMatch(
      supportRequestMock,
      volunteerMock,
      matchInfoMock
    );

    expect(res).toStrictEqual(matchConfirmationMock);
  });
});

describe("confirmMatch errors", () => {
  it("should set matchConfirmation status to 'undelivered' when message sending fails", async () => {
    prismaMock.matchConfirmations.create.mockResolvedValue(
      matchConfirmationMock
    );
    prismaMock.matchConfirmations.update.mockResolvedValue({
      ...matchConfirmationMock,
      status: "undelivered",
    });

    sendTemplateMessageMock.mockRejectedValueOnce(
      new Error(
        `Couldn't send whatsapp message to volunteer for volunteer_id: ${volunteerMock.id}`
      )
    );

    await expect(
      confirmMatch(supportRequestMock, volunteerMock, matchInfoMock)
    ).rejects.toThrow(
      `Couldn't send whatsapp message to volunteer for volunteer_id: ${volunteerMock.id}`
    );

    expect(createMatchConfimationMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock,
      volunteerMock.id,
      matchInfoMock
    );

    expect(undeliveredMatchConfirmationMock).toHaveBeenCalledTimes(1);
  });
});
