import * as sendEmailToMsr from "../../emailClient";
import * as sendEmail from "../../emailClient/sendEmail";
import { checkAvailability } from "../checkAvailability";

const sendEmailMock = jest.spyOn(sendEmail, "default");
const sendEmailToMsrMock = jest.spyOn(sendEmailToMsr, "sendEmailToMsr");

const msrPII = {
  msrId: 1 as unknown as bigint,
  email: "teste@msr.com",
  firstName: "teste",
  phone: "not_found",
  dateOfBirth: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("checkAvailability", () => {
  it("should call sendEmailToMsr with correct params", async () => {
    sendEmailMock.mockResolvedValueOnce(true);
    await checkAvailability(msrPII);

    expect(sendEmailToMsrMock).toHaveBeenNthCalledWith(
      1,
      "teste@msr.com",
      "teste"
    );
  });
});
