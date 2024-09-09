import { sendEmailToMsr } from "..";
import { MSR_EMAIL_TRANSACTION_ID } from "../../constants";
import * as sendEmail from "../../emailClient/sendEmail";
import { supportRequestMock } from "../../matchConfirmation/__mocks__";

const sendEmailMock = jest.spyOn(sendEmail, "default");

const msrPiiMock = {
  email: "msr@gmail.com",
  firstName: "MSR",
};

describe("sendEmailToMsr", () => {
  beforeEach(() => {
    sendEmailMock.mockResolvedValueOnce(true);
  });

  it("should call sendEmail with correct params", async () => {
    const res = await sendEmailToMsr(msrPiiMock, supportRequestMock);
    expect(res).toStrictEqual(true);
    expect(sendEmailMock).toHaveBeenNthCalledWith(
      1,
      "msr@gmail.com",
      MSR_EMAIL_TRANSACTION_ID,
      {
        msr_first_name: "MSR",
        support_request_id: supportRequestMock.supportRequestId.toString(),
        volunteer_type: "advogada",
      }
    );
  });
});
