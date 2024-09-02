import acceptMatch from "../acceptMatch";
import * as matchAcceptedLogic from "../matchAcceptedLogic";
import {
  authenticateMatchMock,
  createMatchMock,
  matchMock,
} from "../__mocks__";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updateTicketMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";

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
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    authenticateMatchMock.mockResolvedValueOnce("abc");
    createMatchMock.mockResolvedValueOnce(matchMock);
  });

  it("should call updateTicketWithConfirmation with correct params", async () => {
    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(updateTicketWithConfirmationMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );
  });

  it("should call authenticateMatch with correct params", async () => {
    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(authenticateMatchMock).toHaveBeenNthCalledWith(1);
  });

  it("should call createMatch with correct params", async () => {
    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(createMatchMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock,
      "abc"
    );
  });

  it("should call confirmMatchConfirmation with correct params", async () => {
    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(confirmMatchConfirmationMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.matchConfirmationId,
      matchMock.matchId
    );
  });
});
