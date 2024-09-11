import {
  msrZendeskTicketMock,
  supportRequestMock,
  updateTicketMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import { updateTicketWithExpiration } from "../matchExpiredLogic";

describe("updateTicketWithExpiration", () => {
  it("should call updateTicket with correct params", async () => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);

    await updateTicketWithExpiration(
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
        body: `A [Voluntária ${volunteerMock.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteerMock.zendeskUserId}) não respondeu após 24h.\n\nO pedido de acolhimento foi encaminhado para a fila do Match Diário.`,
        public: false,
      },
    });
  });

  it("should throw an error if no ticket was updated on Zendesk", async () => {
    updateTicketMock.mockResolvedValueOnce(null);

    await expect(
      updateTicketWithExpiration(
        supportRequestMock.zendeskTicketId,
        volunteerMock
      )
    ).rejects.toThrow("Couldn't update msr Zendesk ticket");
  });
});
