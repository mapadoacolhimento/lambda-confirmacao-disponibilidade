import { LAMBDA_MATCH_URL } from "../../constants";
import { prismaMock } from "../../setupTests";
import {
  matchConfirmationMock,
  msrZendeskTicketMock,
  supportRequestMock,
  updateTicketMock,
  volunteerAvailabilityMock,
  volunteerMock,
} from "../../matchConfirmation/__mocks__";
import {
  authResponseMock,
  fetchMock,
  matchMock,
  matchResponseMock,
} from "../__mocks__";
import {
  authenticateMatch,
  checkShouldMakeVolunteerAvailable,
  createMatch,
  updateTicketWithConfirmation,
} from "../matchAcceptedLogic";

describe("checkShouldMakeVolunteerAvailable", () => {
  it("should return true if volunteer is available for new matches besides the current one", async () => {
    prismaMock.volunteerAvailability.findUnique.mockResolvedValue({
      ...volunteerAvailabilityMock,
      current_matches: 0,
      max_matches: 3,
    });

    const shouldMakeVolunteerAvailable =
      await checkShouldMakeVolunteerAvailable(
        volunteerAvailabilityMock.volunteer_id
      );

    expect(shouldMakeVolunteerAvailable).toStrictEqual(true);
  });

  it("should return false if volunteer is not available for new matches besides the current one", async () => {
    prismaMock.volunteerAvailability.findUnique.mockResolvedValue({
      ...volunteerAvailabilityMock,
      current_matches: 2,
      max_matches: 3,
    });

    const shouldMakeVolunteerAvailable =
      await checkShouldMakeVolunteerAvailable(
        volunteerAvailabilityMock.volunteer_id
      );

    expect(shouldMakeVolunteerAvailable).toStrictEqual(false);
  });
});

describe("updateTicketWithConfirmation", () => {
  it("should call updateTicket with correct params", async () => {
    updateTicketMock.mockResolvedValueOnce(msrZendeskTicketMock);

    await updateTicketWithConfirmation(
      supportRequestMock.zendeskTicketId,
      volunteerMock
    );

    expect(updateTicketMock).toHaveBeenNthCalledWith(1, {
      id: supportRequestMock.zendeskTicketId,
      comment: {
        body: `A [Voluntária ${volunteerMock.firstName}](https://mapadoacolhimento.zendesk.com/agent/users/${volunteerMock.zendeskUserId}) confirmou o match.`,
        public: false,
      },
    });
  });

  it("should throw an error if no ticket was updated on Zendesk", async () => {
    updateTicketMock.mockResolvedValueOnce(null);

    await expect(
      updateTicketWithConfirmation(
        supportRequestMock.zendeskTicketId,
        volunteerMock
      )
    ).rejects.toThrow("Couldn't update msr Zendesk ticket");
  });
});

describe("authenticateMatch", () => {
  it("should call fetch with correct params", async () => {
    fetchMock.mockResolvedValueOnce(authResponseMock);

    await authenticateMatch();

    expect(fetchMock).toHaveBeenNthCalledWith(1, LAMBDA_MATCH_URL + "/sign");
  });

  it("should throw an error if response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ...authResponseMock,
      status: 500,
      statusText: "something went wrong",
    });
    await expect(authenticateMatch()).rejects.toThrow("something went wrong");
  });

  it("should return the auth token", async () => {
    fetchMock.mockResolvedValueOnce(authResponseMock);

    const res = await authenticateMatch();

    expect(res).toStrictEqual("abc");
  });
});

describe("createMatch", () => {
  it("should call fetch with correct params", async () => {
    fetchMock.mockResolvedValueOnce(matchResponseMock);

    const optionsMock = {
      method: "POST",
      body: JSON.stringify({
        supportRequestId: matchConfirmationMock.supportRequestId,
        volunteerId: matchConfirmationMock.volunteerId,
        matchType: matchConfirmationMock.matchType,
        matchStage: matchConfirmationMock.matchStage,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "abc",
      },
    };

    await createMatch(matchConfirmationMock, "abc");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      LAMBDA_MATCH_URL + "/create-match",
      optionsMock
    );
  });

  it("should throw an error if response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ...matchResponseMock,
      status: 500,
      statusText: "something went wrong",
    });
    await expect(createMatch(matchConfirmationMock, "abc")).rejects.toThrow(
      "something went wrong"
    );
  });

  it("should return the match", async () => {
    fetchMock.mockResolvedValueOnce(matchResponseMock);

    const res = await authenticateMatch();

    expect(res).toStrictEqual(matchMock);
  });
});
