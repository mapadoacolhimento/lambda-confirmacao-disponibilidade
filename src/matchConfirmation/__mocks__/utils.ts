import type {
  MatchConfirmationStatus,
  Matches,
  MatchStage,
  MatchType,
  SupportRequests,
  SupportRequestsStatus,
  VolunteerAvailability,
  Volunteers,
} from "@prisma/client";
import type { ZendeskTicket, ZendeskUser } from "../../types";
import * as updateTicket from "../../zendeskClient/updateTicket";
import * as updateUser from "../../zendeskClient/updateUser";

export const supportRequestMock = {
  supportRequestId: 1,
  msrId: 12345 as unknown as bigint,
  zendeskTicketId: 1 as unknown as bigint,
  status: "waiting_for_confirmation" as SupportRequestsStatus,
} as SupportRequests;

export const msrPIIMock = {
  msrId: 12345 as unknown as bigint,
  email: "teste@msr.com",
  firstName: "teste",
  phone: "not_found",
  dateOfBirth: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const volunteerMock = {
  id: 2,
  firstName: "Voluntária",
  zendeskUserId: 10 as unknown as bigint,
  condition: "indisponivel_aguardando_confirmacao",
} as Volunteers;

export const volunteerAvailabilityMock = {
  volunteer_id: 2,
} as VolunteerAvailability;

export const matchConfirmationMock = {
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

export const matchInfoMock = {
  matchType: "daily",
  matchStage: "ideal",
} as Pick<Matches, "matchType" | "matchStage">;

export const updateTicketMock = jest
  .spyOn(updateTicket, "default")
  .mockImplementation(() => Promise.resolve(null));

export const msrZendeskTicketMock = {
  id: 123412341234 as unknown as bigint,
} as ZendeskTicket;

export const updateUserMock = jest
  .spyOn(updateUser, "default")
  .mockImplementation(() => Promise.resolve(null));

export const updatedUserMock = {
  id: 5 as unknown as bigint,
  name: "Teste Voluntária",
  user_fields: {
    condition: "indisponivel_aguardando_confirmacao",
  },
} as ZendeskUser;
