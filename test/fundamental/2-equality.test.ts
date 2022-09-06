/** Test primitive literal equality/identity checkers */

import { is } from "../../lib/equal";
import { assertError, assertValid } from "../common";

describe("value checker", () => {
  function runTests(tests: Map<unknown, unknown[]>) {
    for (const [expectedVal, errorCases] of tests.entries()) {
      errorCases.push(NaN, null, undefined);
      test(`${expectedVal} works`, () => {
        const isExpected = is(expectedVal);
        errorCases.forEach((badVal) => assertError(isExpected(badVal)));
        assertValid(isExpected(expectedVal));
      });
    }
  }
  describe("numbers", () => {
    runTests(
      new Map([
        [0, [false, "0", -1, 1]],
        [1, [true, "1", 0, -1]],
        [-1, [false, true, "-1", 0, 1]],
      ])
    );
  });
  describe("strings", () => {
    runTests(
      new Map([
        ["0", [0, 1, false, "", true]],
        ["1", [0, 1, false, "", true]],
        ["false", [0, 1, false, "", true]],
        ["true", [0, 1, false, "", true]],
        ["", [0, 1, false, true]],
        ["undefined", [0, 1, false, "", true]],
      ])
    );
  });
  describe("booleans", () => {
    runTests(
      new Map([
        [true, [1, "true", "", {}, { a: true }, false, [], [""], [true]]],
        [false, [0, true, "", "false", {}, { b: false }, [], [""], [false]]],
      ])
    );
  });
});
