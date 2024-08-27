import type { Matches } from "@prisma/client";
import * as matchAcceptedLogic from "../matchAcceptedLogic";

export const fetchMock = jest.spyOn(global, "fetch");

export const authDataMock = { message: "abc" };

export const authResponseMock = {
  ok: true,
  status: 200,
  json: async () => Promise.resolve(authDataMock),
} as Response;

export const matchMock = {
  matchId: 1,
  msrId: 1 as unknown as bigint,
  supportRequestId: 1,
  volunteerId: 1,
  supportType: "legal",
  msrZendeskTicketId: 1 as unknown as bigint,
  volunteerZendeskTicketId: 2 as unknown as bigint,
  matchType: "daily",
  matchStage: "ideal",
  updatedAt: new Date(),
  createdAt: new Date(),
} as Matches;

export const matchDataMock = { message: matchMock };

export const matchResponseMock = {
  ok: true,
  status: 200,
  json: async () => Promise.resolve(matchDataMock),
} as Response;

export const createMatchMock = jest.spyOn(matchAcceptedLogic, "createMatch");
export const authenticateMatchMock = jest.spyOn(
  matchAcceptedLogic,
  "authenticateMatch"
);
