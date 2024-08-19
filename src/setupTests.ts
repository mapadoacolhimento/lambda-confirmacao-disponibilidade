import type { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "./prismaClient";

jest.mock("./prismaClient", () => ({
  ...jest.requireActual("./prismaClient"),
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

process.env["TWILIO_ACCOUNT_SID"] = "ACXXXX";
process.env["TWILIO_AUTH_TOKEN"] = "a";

process.env["ZENDESK_SUBDOMAIN"] = "a";
process.env["ZENDESK_API_URL"] = "a";
process.env["ZENDESK_API_USER"] = "a";
process.env["ZENDESK_API_TOKEN"] = "a";
