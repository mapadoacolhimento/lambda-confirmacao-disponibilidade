import { sendEmailToMsr } from "..";
import * as sendEmail from "../../emailClient/sendEmail";

const sendEmailMock = jest.spyOn(sendEmail, "default");
const msr = {
  email: "teste@msr.com",
  firstName: "teste",
};

describe("sendEmailToMsr", () => {
  it("should call sendEmail with correct params", async () => {
    sendEmailMock.mockResolvedValueOnce(true);
    const res = await sendEmailToMsr(msr.email, msr.firstName);
    expect(res).toStrictEqual(true);
    expect(sendEmailMock).toHaveBeenNthCalledWith(
      1,
      "teste@msr.com",
      "clzspeh8m00jw10mfp8yl96ih",
      {
        msr_first_name: "teste",
      }
    );
  });
});
