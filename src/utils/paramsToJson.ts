export default function paramsToJson(str: string) {
  const parsedStr = JSON.parse(
    '{"' +
      decodeURI(str)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  );
  return parsedStr;
}
