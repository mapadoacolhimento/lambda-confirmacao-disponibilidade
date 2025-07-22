import * as matchDeniedLogic from "../matchDeniedLogic";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updatedUserMock,
  updateTicketMock,
  updateUserMock,
  volunteerMock,
  volunteerStatusHistoryMock,
} from "../../matchConfirmation/__mocks__";
import denyMatch from "../denyMatch";
import { prismaMock } from "../../setupTests";

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

const fetchPreviousVolunteerStatusMock = jest.spyOn(
  matchDeniedLogic,
  "fetchPreviousVolunteerStatus"
);

const updateVolunteerStatusMock = jest.spyOn(
  matchDeniedLogic,
  "updateVolunteerStatus"
);

describe("denyMatch", () => {
  beforeEach(() => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);
    updateUserMock.mockResolvedValueOnce(updatedUserMock);
    prismaMock.volunteerStatusHistory.findFirstOrThrow.mockResolvedValueOnce(
      volunteerStatusHistoryMock
    );
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

  it("should call fetchPreviousVolunteerStatus with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(fetchPreviousVolunteerStatusMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock.id
    );
  });

  it("should call updateVolunteerStatus with correct params", async () => {
    await denyMatch(matchConfirmationMock, supportRequestMock, volunteerMock);

    expect(updateVolunteerStatusMock).toHaveBeenNthCalledWith(
      1,
      volunteerMock,
      volunteerStatusHistoryMock.status
    );
  });
});
