import { VALUE_MAX, VALUE_MIN } from "../config";

export const generateRandomData = (size: number) =>
  Array.from(
    { length: size },
    () => Math.floor(Math.random() * (VALUE_MAX - VALUE_MIN + 1)) + VALUE_MIN,
  );
