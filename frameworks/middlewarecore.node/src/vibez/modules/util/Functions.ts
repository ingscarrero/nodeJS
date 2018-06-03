import { MAX_RANDOM_STRING_LENGTH, RANDOM_STRING_OFFSET } from "./Utils";
export function randomString(length: number): string {
  if (length > MAX_RANDOM_STRING_LENGTH - RANDOM_STRING_OFFSET) {
  }
  return (
    Date.now().toString(MAX_RANDOM_STRING_LENGTH) +
    Math.random()
      .toString(MAX_RANDOM_STRING_LENGTH)
      .substr(RANDOM_STRING_OFFSET, length)
  ).toUpperCase();
}
