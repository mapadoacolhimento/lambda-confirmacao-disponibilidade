import { sendEmailToMsr } from "..";
import { MSR_EMAIL_TRANSACTION_ID } from "../../constants";
import * as sendEmail from "../../emailClient/sendEmail";

const sendEmailMock = jest.spyOn(sendEmail, "default");

describe("sendEmailToMsr", () => {
  beforeEach(() => {
    sendEmailMock.mockResolvedValueOnce(true);
  });

  it("should call sendEmail with correct params", async () => {
    const res = await sendEmailToMsr("msr@gmail.com", "MSR");
    expect(res).toStrictEqual(true);
    expect(sendEmailMock).toHaveBeenNthCalledWith(
      1,
      "msr@gmail.com",
      MSR_EMAIL_TRANSACTION_ID,
      {
        msr_first_name: "MSR",
      }
    );
  });
});
