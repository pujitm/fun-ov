import { resultIsError } from "../lib/rules";

/**
 * Asserts that the result of a validation check is erroneous
 * @param result
 */
export const assertError = (result) => {
  expect(result).toBeDefined();
  expect(resultIsError(result)).toBeTruthy();
};

/**
 * Asserts that the result of a validation check is not erroneous
 * @param result
 */
export const assertValid = (result) => {
  expect(result).toBeUndefined();
};
