import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerAvailabilityMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import { prismaMock } from "../../setupTests";
import {
  checkPreviousMatchConfirmations,
  makeVolunteerAvailable,
  updateTicketWithDenial,
} from "../matchDeniedLogic";

describe("updateTicketWithDenial", () => {
  it("should call updateTicket with correct params", async () => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);

    await updateTicketWithDenial(
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );

    expect(updateTicketMock).toHaveBeenNthCalledWith(1, {
      id: supportRequestMock.zendeskTicketId,
      custom_fields: [
        {
          id: 360014379412,
          value: "aguardando_match__sem_prioridade",
        },
      ],
      comment: {
        body: `A [Voluntária ${volunteerMock.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteerMock.zendeskUserId}) negou o match.\n\nO pedido de acolhimento foi encaminhado para a fila do Match Diário.`,
        public: false,
      },
    });
  });

  it("should throw an error if no ticket was updated on Zendesk", async () => {
    updateTicketMock.mockResolvedValueOnce(null);

    await expect(
      updateTicketWithDenial(supportRequestMock.zendeskTicketId, volunteerMock)
    ).rejects.toThrow("Couldn't update msr Zendesk ticket");
  });
});

describe("makeVolunteerAvailable", () => {
  it("should throw an error if no volunteer was updated on Zendesk", async () => {
    updateUserMock.mockResolvedValueOnce(null);

    await expect(makeVolunteerAvailable(volunteerMock)).rejects.toThrow(
      "Couldn't update volunteer Zendesk status"
    );
  });

  it("should update volunteer condition to disponivel and return this entry", async () => {
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    prismaMock.volunteers.update.mockResolvedValue(volunteerMock);
    prismaMock.volunteerAvailability.update.mockResolvedValue(
      volunteerAvailabilityMock
    );

    const res = await makeVolunteerAvailable(volunteerMock);

    expect(res).toStrictEqual(volunteerMock);
  });
});

describe("checkPreviousMatchConfirmations", () => {
  it("should return true if support_request has previous match confirmations", async () => {
    prismaMock.matchConfirmations.findMany.mockResolvedValueOnce([
      matchConfirmationMock,
    ]);

    const res = await checkPreviousMatchConfirmations(
      supportRequestMock.supportRequestId
    );

    expect(res).toStrictEqual(true);
  });

  it("should return false if support_request doesn't have previous match confirmations", async () => {
    prismaMock.matchConfirmations.findMany.mockResolvedValueOnce([]);

    const res = await checkPreviousMatchConfirmations(
      supportRequestMock.supportRequestId
    );

    expect(res).toStrictEqual(false);
  });
});
