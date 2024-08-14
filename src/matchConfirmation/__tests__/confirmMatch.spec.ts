import type { MatchConfirmationStatus } from "@prisma/client";
import { prismaMock } from "../../setupTests";
import * as confirmationLogic from "../confirmationLogic";
import confirmMatch from "../confirmMatch";

const createMatchConfimationMock = jest.spyOn(
  confirmationLogic,
  "createMatchConfirmation"
);

const supportRequestId = 1;
const msrPII = {
  msrId: 12345 as unknown as bigint,
  email: "teste@msr.com",
  firstName: "teste",
  phone: "not_found",
  dateOfBirth: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};
const volunteerId = 2;
const matchConfirmation = {
  matchConfirmationId: 1,
  supportRequestId: 1,
  msrId: 12345 as unknown as bigint,
  volunteerId: 2,
  status: "waiting" as MatchConfirmationStatus,
  matchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("confirmMatch", () => {
  it("should call createMatchConfirmation with correct params", async () => {
    await confirmMatch(supportRequestId, msrPII, volunteerId);

    expect(createMatchConfimationMock).toHaveBeenNthCalledWith(1, 1, 12345, 2);
  });

  it("should create an entry in match_confirmations table and return this entry", async () => {
    prismaMock.matchConfirmations.create.mockResolvedValue(matchConfirmation);

    const res = await confirmMatch(supportRequestId, msrPII, volunteerId);

    expect(res).toStrictEqual(matchConfirmation);
  });
});
