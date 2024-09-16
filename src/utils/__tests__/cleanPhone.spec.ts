import cleanPhone from "../cleanPhone";

describe("cleanPhone", () => {
  it("should clean the phone number, returning the last 11 digits", () => {
    const res = cleanPhone("whatsapp:+5511123456789");

    expect(res).toStrictEqual("11123456789");
  });
});
