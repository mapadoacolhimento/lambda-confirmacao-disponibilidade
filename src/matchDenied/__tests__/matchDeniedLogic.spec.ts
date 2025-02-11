import {
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerAvailabilityMock,
  volunteerMock,
  volunteerStatusHistoryMock,
} from "../../matchConfirmation/__mocks__";
import { prismaMock } from "../../setupTests";
import {
  fetchPreviousVolunteerStatus,
  updateTicketWithDenial,
  updateVolunteerStatusToPreviousValue,
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

describe("fetchPreviousVolunteerStatus", () => {
  it("should throw an error if no previous status was found", async () => {
    prismaMock.volunteerStatusHistory.findFirstOrThrow.mockRejectedValueOnce(
      new Error("Volunteer status not found")
    );

    await expect(
      fetchPreviousVolunteerStatus(volunteerMock.id)
    ).rejects.toThrow("Volunteer status not found");
  });

  it("should return the volunteer status", async () => {
    prismaMock.volunteerStatusHistory.findFirstOrThrow.mockResolvedValue(
      volunteerStatusHistoryMock
    );

    const previousStatus = await fetchPreviousVolunteerStatus(volunteerMock.id);

    expect(previousStatus).toStrictEqual(volunteerStatusHistoryMock.status);
  });
});

describe("updateVolunteerStatusToPreviousValue", () => {
  it("should throw an error if no volunteer was updated on Zendesk", async () => {
    updateUserMock.mockResolvedValueOnce(null);

    await expect(
      updateVolunteerStatusToPreviousValue(
        volunteerMock,
        volunteerStatusHistoryMock.status
      )
    ).rejects.toThrow("Couldn't update volunteer Zendesk status");
  });

  it("should update volunteer condition to previousValue and return this entry", async () => {
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    prismaMock.volunteerStatusHistory.create.mockResolvedValue(
      volunteerStatusHistoryMock
    );
    prismaMock.volunteers.update.mockResolvedValue({
      ...volunteerMock,
      condition: volunteerStatusHistoryMock.status,
    });
    prismaMock.volunteerAvailability.update.mockResolvedValue(
      volunteerAvailabilityMock
    );

    const res = await updateVolunteerStatusToPreviousValue(
      volunteerMock,
      volunteerStatusHistoryMock.status
    );

    expect(res).toStrictEqual({
      ...volunteerMock,
      condition: volunteerStatusHistoryMock.status,
    });
  });
});
