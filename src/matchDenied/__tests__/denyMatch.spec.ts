import * as matchDeniedLogic from "../matchDeniedLogic";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import denyMatch from "../denyMatch";

const updateTicketWithDenialMock = jest.spyOn(
  matchDeniedLogic,
  "updateTicketWithDenial"
);
const denyMatchConfirmationMock = jest.spyOn(
  matchDeniedLogic,
  "denyMatchConfirmation"
);
const addSupportRequestToQueueMock = jest.spyOn(
  matchDeniedLogic,
  "addSupportRequestToQueue"
);

const makeVolunteerAvailableMock = jest.spyOn(
  matchDeniedLogic,
  "makeVolunteerAvailable"
);

describe("denyMatch", () => {
  beforeEach(() => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
  });

  it("should call updateTicketWithDenial with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(updateTicketWithDenialMock).toHaveBeenNthCalledWith(
      1,
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );
  });

  it("should call denyMatchConfirmation with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(denyMatchConfirmationMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.matchConfirmationId
    );
  });

  it("should call addSupportRequestToQueue with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(addSupportRequestToQueueMock).toHaveBeenNthCalledWith(
      1,
      matchConfirmationMock.supportRequestId
    );
  });

  it("should call makeVolunteerAvailable with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(makeVolunteerAvailableMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock
    );
  });
});
