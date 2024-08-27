import acceptMatch from "../acceptMatch";
import * as matchAcceptedLogic from "../matchAcceptedLogic";
import * as utils from "../../utils";
import {
  authenticateMatchMock,
  buttonPayloadMock,
  createMatchMock,
  matchMock,
} from "../__mocks__";
import { prismaMock } from "../../setupTests";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updateTicketMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";

const getMatchConfirmationIdMock = jest.spyOn(
  matchAcceptedLogic,
  "getMatchConfirmationId"
);
const fetchMatchConfirmationMock = jest.spyOn(
  matchAcceptedLogic,
  "fetchMatchConfirmation"
);
const fetchSupportRequestAndVolunteerMock = jest.spyOn(
  utils,
  "fetchSupportRequestAndVolunteer"
);
const updateTicketWithConfirmationMock = jest.spyOn(
  matchAcceptedLogic,
  "updateTicketWithConfirmation"
);
const confirmMatchConfirmationMock = jest.spyOn(
  matchAcceptedLogic,
  "confirmMatchConfirmation"
);

describe("acceptMatch", () => {
  beforeEach(() => {
    prismaMock.matchConfirmations.findUniqueOrThrow.mockResolvedValue(
      matchConfirmationMock
    );
    prismaMock.supportRequests.findUniqueOrThrow.mockResolvedValue(
      supportRequestMock
    );
    prismaMock.volunteers.findUniqueOrThrow.mockResolvedValue(volunteerMock);
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    authenticateMatchMock.mockResolvedValueOnce("abc");
    createMatchMock.mockResolvedValueOnce(matchMock);
  });
  it("should call getMatchConfirmationId with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(getMatchConfirmationIdMock).toHaveBeenNthCalledWith(
      1,
      buttonPayloadMock
    );
  });

  it("should call fetchMatchConfirmation with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(fetchMatchConfirmationMock).toHaveBeenNthCalledWith(1, 12345);
  });

  it("should call fetchSupportRequestAndVolunteer with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(fetchSupportRequestAndVolunteerMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId,
      matchConfirmationMock.volunteerId
    );
  });

  it("should call updateTicketWithConfirmation with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(updateTicketWithConfirmationMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );
  });

  it("should call authenticateMatch with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(authenticateMatchMock).toHaveBeenNthCalledWith(1);
  });

  it("should call createMatch with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(createMatchMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock,
      "abc"
    );
  });

  it("should call confirmMatchConfirmation with correct params", async () => {
    await acceptMatch(buttonPayloadMock);

    expect(confirmMatchConfirmationMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.matchConfirmationId,
      matchMock.matchId
    );
  });
});
