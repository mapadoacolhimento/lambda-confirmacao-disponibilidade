export default function parseParamsToJson(str: string | null) {
  try {
    if (!str) return null;

    const decodedStr = decodeURI(str);
    const replacedStr = decodedStr
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"');
    const parsedStr = JSON.parse(`{"${replacedStr}"}`);

    return parsedStr;
  } catch (e) {
    return null;
  }
}
