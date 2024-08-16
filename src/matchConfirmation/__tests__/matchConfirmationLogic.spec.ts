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

describe("sendWhatsAppMessage", () => {
  it("should call createMessage with WHATSAPP_TEMPLATE_WITHOUT_CITY_ID if msr doesn't have city information", async () => {
    createMessageMock.mockResolvedValueOnce(sentMessageMock);

    await sendWhatsAppMessage(volunteerMock, {
      ...supportRequestMock,
      city: "not_found",
      state: "not_found",
    });

    expect(createMessageMock).toHaveBeenNthCalledWith(
      1,
      WHATSAPP_TEMPLATE_WITHOUT_CITY_ID,
      volunteerMock.phone,
      {
        1: volunteerMock.firstName,
      }
    );
  });

  it("should call createMessage with WHATSAPP_TEMPLATE_WITH_CITY_ID if msr has city information", async () => {
    createMessageMock.mockResolvedValueOnce(sentMessageMock);
    prismaMock.cities.findFirst.mockResolvedValue(cityMock);

    await sendWhatsAppMessage(volunteerMock, {
      ...supportRequestMock,
      city: "SAO PAULO",
      state: "SP",
    });

    expect(createMessageMock).toHaveBeenNthCalledWith(
      1,
      WHATSAPP_TEMPLATE_WITH_CITY_ID,
      volunteerMock.phone,
      {
        1: volunteerMock.firstName,
        2: "São Paulo (SP)",
      }
    );
  });

  it("should throw an error if message wasn't sent", async () => {
    createMessageMock.mockResolvedValueOnce(null);

    await expect(
      sendWhatsAppMessage(volunteerMock, supportRequestMock)
    ).rejects.toThrow("Couldn't send message to volunteer");
  });

  it("should return the message sent to volunteer", async () => {
    createMessageMock.mockResolvedValueOnce(sentMessageMock);

    const res = await sendWhatsAppMessage(volunteerMock, supportRequestMock);

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
