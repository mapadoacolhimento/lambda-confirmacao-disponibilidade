import acceptMatch from "../acceptMatch";
import * as matchAcceptedLogic from "../matchAcceptedLogic";
import * as matchDeniedLogic from "../../matchDenied/matchDeniedLogic";
import {
  authenticateMatchMock,
  createMatchMock,
  matchMock,
} from "../__mocks__";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
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

const checkShouldMakeVolunteerAvailableMock = jest.spyOn(
  matchAcceptedLogic,
  "checkShouldMakeVolunteerAvailable"
);

const makeVolunteerAvailableMock = jest.spyOn(
  matchDeniedLogic,
  "makeVolunteerAvailable"
);

describe("acceptMatch", () => {
  beforeEach(() => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
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

  it("should call checkShouldMakeVolunteerAvailable with correct params", async () => {
    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(checkShouldMakeVolunteerAvailableMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock.id
    );
  });

  it("if checkShouldMakeVolunteerAvailable returns true, it should call makeVolunteerAvailable with correct params", async () => {
    checkShouldMakeVolunteerAvailableMock.mockResolvedValueOnce(true);

    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(makeVolunteerAvailableMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock
    );
  });

  it("if checkShouldMakeVolunteerAvailable returns false, it should not call makeVolunteerAvailable", async () => {
    checkShouldMakeVolunteerAvailableMock.mockResolvedValueOnce(false);

    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(makeVolunteerAvailableMock).not.toHaveBeenNthCalledWith(
      1,
      volunteerMock
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
