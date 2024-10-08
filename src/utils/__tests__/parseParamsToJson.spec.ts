import { parseParamsToJson } from "../index";

describe("parseParamsToJson()", () => {
  it("should parse a string with params to a valid json", () => {
    const str =
      "SmsMessageSid=SM802c0d39a503aae472cee7379abff9f6&NumMedia=0&ProfileName=Camila+Cardoso&MessageType=text&SmsSid=SM802c0d39a503aae472cee7379abff9f6&WaId=5513997270748&SmsStatus=received&Body=Oi&To=whatsapp%3A%2B551151963407&MessagingServiceSid=MG079062f161fcf64622214b97dfe44e3c&NumSegments=1&ReferralNumMedia=0&MessageSid=SM802c0d39a503aae472cee7379abff9f6&From=whatsapp%3A%2B5513997270748&ApiVersion=2010-04-01";

    const json = {
      SmsMessageSid: "SM802c0d39a503aae472cee7379abff9f6",
      NumMedia: "0",
      ProfileName: "Camila+Cardoso",
      MessageType: "text",
      SmsSid: "SM802c0d39a503aae472cee7379abff9f6",
      WaId: "5513997270748",
      SmsStatus: "received",
      Body: "Oi",
      To: "whatsapp%3A%2B551151963407",
      MessagingServiceSid: "MG079062f161fcf64622214b97dfe44e3c",
      NumSegments: "1",
      ReferralNumMedia: "0",
      MessageSid: "SM802c0d39a503aae472cee7379abff9f6",
      From: "whatsapp%3A%2B5513997270748",
      ApiVersion: "2010-04-01",
    };

    const res = parseParamsToJson(str);
    expect(res).toStrictEqual(json);
  });

  it("should return null if string isn't valid", () => {
    const str = "a";

    expect(parseParamsToJson(str)).toStrictEqual(null);
  });

  it("should return null if string is null", () => {
    const str = null;

    expect(parseParamsToJson(str)).toStrictEqual(null);
  });
});
