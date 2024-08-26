import { prismaMock } from "../../setupTests";
import {
  createMatchConfirmation,
  initCap,
  makeVolunteerUnavailable,
  sendWhatsAppMessage,
  updateMsrZendeskTicket,
  updateSupportRequest,
} from "../matchConfirmationLogic";
import {
  cityMock,
  matchConfirmationMock,
  matchInfoMock,
  msrZendeskTicketMock,
  sendTemplateMessageMock,
  sentMessageMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerAvailabilityMock,
  volunteerMock,
} from "../__mocks__/utils";
import {
  WHATSAPP_TEMPLATE_WITH_CITY_ID,
  WHATSAPP_TEMPLATE_WITHOUT_CITY_ID,
} from "../../constants";

describe("createMatchConfirmation", () => {
  it("should create an entry in match_confirmations table and return this entry", async () => {
    prismaMock.matchConfirmations.create.mockResolvedValue(
      matchConfirmationMock
    );

    const res = await createMatchConfirmation(
      supportRequestMock,
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

describe("sendWhatsAppMessage", () => {
  it("should call createMessage with WHATSAPP_TEMPLATE_WITHOUT_CITY_ID if msr doesn't have city information", async () => {
    sendTemplateMessageMock.mockResolvedValueOnce(sentMessageMock);

    await sendWhatsAppMessage(
      volunteerMock,
      {
        ...supportRequestMock,
        city: "not_found",
        state: "not_found",
      },
      matchConfirmationMock.matchConfirmationId
    );

    expect(sendTemplateMessageMock).toHaveBeenNthCalledWith(
      1,
      WHATSAPP_TEMPLATE_WITHOUT_CITY_ID,
      volunteerMock.phone,
      {
        volunteerName: volunteerMock.firstName,
        matchConfirmationId:
          matchConfirmationMock.matchConfirmationId.toString(),
      }
    );
  });

  it("should call createMessage with WHATSAPP_TEMPLATE_WITH_CITY_ID if msr has city information", async () => {
    sendTemplateMessageMock.mockResolvedValueOnce(sentMessageMock);
    prismaMock.cities.findFirst.mockResolvedValue(cityMock);

    await sendWhatsAppMessage(
      volunteerMock,
      {
        ...supportRequestMock,
        city: "SAO PAULO",
        state: "SP",
      },
      matchConfirmationMock.matchConfirmationId
    );

    expect(sendTemplateMessageMock).toHaveBeenNthCalledWith(
      1,
      WHATSAPP_TEMPLATE_WITH_CITY_ID,
      volunteerMock.phone,
      {
        volunteerName: volunteerMock.firstName,
        matchConfirmationId:
          matchConfirmationMock.matchConfirmationId.toString(),
        msrCity: "São Paulo (SP)",
      }
    );
  });

  it("should throw an error if message wasn't sent", async () => {
    sendTemplateMessageMock.mockResolvedValueOnce(null);

    await expect(
      sendWhatsAppMessage(
        volunteerMock,
        supportRequestMock,
        matchConfirmationMock.matchConfirmationId
      )
    ).rejects.toThrow(
      `Couldn't send whatsapp message to volunteer for volunteer_id: ${volunteerMock.id}`
    );
  });

  it("should return the message sent to volunteer", async () => {
    sendTemplateMessageMock.mockResolvedValueOnce(sentMessageMock);

    const res = await sendWhatsAppMessage(
      volunteerMock,
      supportRequestMock,
      matchConfirmationMock.matchConfirmationId
    );

    expect(res).toStrictEqual(sentMessageMock);
  });
});

describe("initCap", () => {
  it("should capitalize all words in a upper case string", () => {
    const upperCaseString = "RIO DE JANEIRO";

    const formattedUpperCaseString = initCap(upperCaseString);

    expect(formattedUpperCaseString).toStrictEqual("Rio De Janeiro");
  });

  it("should capitalize all words in a lower case string", () => {
    const lowerCaseString = "rio de janeiro";

    const formattedLowerCaseString = initCap(lowerCaseString);

    expect(formattedLowerCaseString).toStrictEqual("Rio De Janeiro");
  });

  it("should capitalize all words in a mixed case string", () => {
    const mixedString = "RiO dE janEIro";

    const formattedMixedString = initCap(mixedString);

    expect(formattedMixedString).toStrictEqual("Rio De Janeiro");
  });
});
