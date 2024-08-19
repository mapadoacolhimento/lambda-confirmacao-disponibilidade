export default function paramsToJson(str: string | null) {
  try {
    if (!str) return null;

    const parsedStr = JSON.parse(
      '{"' +
        decodeURI(str)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"') +
        '"}'
    );
    return parsedStr;
  } catch (e) {
    return null;
  }
}
