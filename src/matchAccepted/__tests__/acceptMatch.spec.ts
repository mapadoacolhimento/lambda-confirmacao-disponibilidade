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

const checkMaxMatchesMock = jest.spyOn(matchAcceptedLogic, "checkMaxMatches");

const fetchPreviousVolunteerStatusMock = jest.spyOn(
  matchDeniedLogic,
  "fetchPreviousVolunteerStatus"
);

const updateVolunteerStatusToPreviousValueMock = jest.spyOn(
  matchDeniedLogic,
  "updateVolunteerStatusToPreviousValue"
);

describe("acceptMatch", () => {
  beforeEach(() => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    authenticateMatchMock.mockResolvedValueOnce("abc");
    createMatchMock.mockResolvedValueOnce(matchMock);
    checkMaxMatchesMock.mockResolvedValueOnce(true);
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

  it("should call checkMaxMatches with correct params", async () => {
    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(checkMaxMatchesMock).toHaveBeenNthCalledWith(1, volunteerMock.id);
  });

  it("if checkMaxMatches returns false, it should call fetchPreviousVolunteerStatus with correct params", async () => {
    checkMaxMatchesMock.mockReset();
    checkMaxMatchesMock.mockResolvedValueOnce(false);
    fetchPreviousVolunteerStatusMock.mockResolvedValueOnce("disponivel");

    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(fetchPreviousVolunteerStatusMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock.id
    );
  });

  it("if checkMaxMatches returns false, it should call updateVolunteerStatusToPreviousValue with correct params", async () => {
    checkMaxMatchesMock.mockReset();
    checkMaxMatchesMock.mockResolvedValueOnce(false);
    fetchPreviousVolunteerStatusMock.mockResolvedValueOnce("disponivel");

    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(updateVolunteerStatusToPreviousValueMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock,
      "disponivel"
    );
  });

  it("if checkMaxMatches returns true, it should not call updateVolunteerStatusToPreviousValue", async () => {
    checkMaxMatchesMock.mockReset();
    checkMaxMatchesMock.mockResolvedValueOnce(true);

    await acceptMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(
      updateVolunteerStatusToPreviousValueMock
    ).not.toHaveBeenNthCalledWith(1, volunteerMock);
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
