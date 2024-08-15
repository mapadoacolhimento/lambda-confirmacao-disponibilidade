import { prismaMock } from "../../setupTests";
import {
  createMatchConfirmation,
  makeVolunteerUnavailable,
  updateMsrZendeskTicket,
  updateSupportRequest,
} from "../matchConfirmationLogic";
import {
  matchConfirmationMock,
  matchInfoMock,
  msrPIIMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerAvailabilityMock,
  volunteerMock,
} from "../__mocks__/utils";

describe("createMatchConfirmation", () => {
  it("should create an entry in match_confirmations table and return this entry", async () => {
    prismaMock.matchConfirmations.create.mockResolvedValue(
      matchConfirmationMock
    );

    const res = await createMatchConfirmation(
      supportRequestMock.supportRequestId,
      msrPIIMock.msrId,
      volunteerMock.id,
      matchInfoMock
    );

    expect(res).toStrictEqual(matchConfirmationMock);
  });
});

describe("updateSupportRequest", () => {
  it("should update the support_request and return the support_request_id", async () => {
    prismaMock.supportRequests.update.mockResolvedValue(supportRequestMock);

    const res = await updateSupportRequest(supportRequestMock.supportRequestId);

    expect(res).toStrictEqual(supportRequestMock);
  });
});

describe("updateMsrZendeskTicket", () => {
  it("should call updateTicket with correct params", async () => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);

    await updateMsrZendeskTicket(
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );

    expect(updateTicketMock).toHaveBeenNthCalledWith(1, {
      id: supportRequestMock.zendeskTicketId,
      custom_fields: [
        {
          id: 360014379412,
          value: "encaminhamento__aguardando_confirmação",
        },
      ],
      comment: {
        body: `**Encaminhamento: Aguardando Confirmação** \n\n Enviamos uma mensagem para a [Voluntária ${volunteerMock.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteerMock.zendeskUserId}) e estamos aguardando a sua confirmação para realizar o encaminhamento.`,
        public: false,
      },
    });
  });

  it("should throw an error if no ticket was updated on Zendesk", async () => {
    updateTicketMock.mockResolvedValueOnce(null);

    await expect(
      updateMsrZendeskTicket(supportRequestMock.zendeskTicketId, volunteerMock)
    ).rejects.toThrow("Couldn't update msr Zendesk ticket");
  });

  it("should return the updated ticket", async () => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);

    const res = await updateMsrZendeskTicket(
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );

    expect(res).toStrictEqual(msrZendeskTicketMock);
  });
});

describe("makeVolunteerUnavailable", () => {
  it("should return null if volunteer zendeskUserId is null", async () => {
    const res = await makeVolunteerUnavailable({
      ...volunteerMock,
      zendeskUserId: null,
    });

    expect(res).toStrictEqual(null);
  });

  it("should throw an error if no volunteer was updated on Zendesk", async () => {
    updateUserMock.mockResolvedValueOnce(null);

    await expect(makeVolunteerUnavailable(volunteerMock)).rejects.toThrow(
      "Couldn't update volunteer Zendesk status"
    );
  });

  it("should update volunteer condition to indisponivel_aguardando_confirmacao and return this entry", async () => {
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    prismaMock.volunteers.update.mockResolvedValue(volunteerMock);
    prismaMock.volunteerAvailability.update.mockResolvedValue(
      volunteerAvailabilityMock
    );

    const res = await makeVolunteerUnavailable(volunteerMock);

    expect(res).toStrictEqual(volunteerMock);
  });
});
