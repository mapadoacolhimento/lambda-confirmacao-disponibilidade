import type {
  MatchConfirmationStatus,
  Matches,
  MatchStage,
  MatchType,
  SupportRequestsStatus,
  SupportType,
} from "@prisma/client";
import { prismaMock } from "../../setupTests";
import {
  createMatchConfirmation,
  updateMsrZendeskTicket,
  updateSupportRequest,
} from "../matchConfirmationLogic";
import * as updateTicket from "../../zendeskClient/updateTicket";
import type { ZendeskTicket } from "../../types";

const supportRequest = {
  supportRequestId: 1,
  msrId: 12345 as unknown as bigint,
  zendeskTicketId: 1 as unknown as bigint,
  supportType: "psychological" as SupportType,
  supportExpertise: "not_found",
  priority: null,
  hasDisability: null,
  requiresLibras: null,
  acceptsOnlineSupport: true,
  city: "SAO PAULO",
  state: "SP",
  lat: null,
  lng: null,
  status: "waiting_for_confirmation" as SupportRequestsStatus,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const msrPII = {
  msrId: 12345 as unknown as bigint,
  email: "teste@msr.com",
  firstName: "teste",
  phone: "not_found",
  dateOfBirth: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const volunteer = {
  id: 2,
  firstName: "Voluntária",
  zendeskUserId: 10 as unknown as bigint,
};

const matchConfirmation = {
  matchConfirmationId: 1,
  supportRequestId: 1,
  msrId: 12345 as unknown as bigint,
  volunteerId: 2,
  status: "waiting" as MatchConfirmationStatus,
  matchType: "daily" as MatchType,
  matchStage: "ideal" as MatchStage,
  matchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const matchInfo = {
  matchType: "daily",
  matchStage: "ideal",
} as Pick<Matches, "matchType" | "matchStage">;

describe("createMatchConfirmation", () => {
  it("should create an entry in match_confirmations table and return this entry", async () => {
    prismaMock.matchConfirmations.create.mockResolvedValue(matchConfirmation);

    const res = await createMatchConfirmation(
      supportRequest.supportRequestId,
      msrPII.msrId,
      volunteer.id,
      matchInfo
    );

    expect(res).toStrictEqual(matchConfirmation);
  });
});

describe("updateSupportRequest", () => {
  it("should update the support_request and return the support_request_id", async () => {
    prismaMock.supportRequests.update.mockResolvedValue(supportRequest);

    const res = await updateSupportRequest(supportRequest.supportRequestId);

    expect(res).toStrictEqual(supportRequest);
  });
});

describe("updateMsrZendeskTicket", () => {
  const updateTicketMock = jest
    .spyOn(updateTicket, "default")
    .mockImplementation(() => Promise.resolve(null));

  it("should call updateTicket with correct params", async () => {
    await updateMsrZendeskTicket(supportRequest.zendeskTicketId, volunteer);

    expect(updateTicketMock).toHaveBeenNthCalledWith(1, {
      id: supportRequest.zendeskTicketId,
      custom_fields: [
        {
          id: 360014379412,
          value: "encaminhamento__aguardando_confirmação",
        },
      ],
      comment: {
        body: `**Encaminhamento: Aguardando Confirmação** \n\n Enviamos uma mensagem para a [Voluntária ${volunteer.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteer.zendeskUserId}) e estamos aguardando a sua confirmação para realizar o encaminhamento.`,
        public: false,
      },
    });
  });

  it("should return null if the ticket wasn't updated", async () => {
    updateTicketMock.mockResolvedValueOnce(null);

    const res = await updateMsrZendeskTicket(
      supportRequest.zendeskTicketId,
      volunteer
    );

    expect(res).toStrictEqual(null);
  });

  it("should return the updated ticket", async () => {
    const mockMsrZendeskTicket = {
      id: 123412341234 as unknown as bigint,
    } as ZendeskTicket;

    updateTicketMock.mockResolvedValueOnce(mockMsrZendeskTicket);

    const res = await updateMsrZendeskTicket(
      supportRequest.zendeskTicketId,
      volunteer
    );

    expect(res).toStrictEqual(mockMsrZendeskTicket);
  });
});
