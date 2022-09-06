/** Test type validation checkers */

import * as Lib from "../../lib/type-checks";
import { assertError, assertValid } from "../common";

type ValidationResult = "error" | "valid";
type TestValues = unknown[];
type Cases = Record<ValidationResult, TestValues>;
type LibTest = Record<keyof typeof Lib, Cases>; // Ensure coverage

const flatten = (obj: Object) => Object.values(obj).flat();

// ────────────────────────────────────────────────────────────────────────────────
// ─── Setup ──────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

/**
 * For convenience, contains valid representations of types indicated by properties.
 *
 * Plural property names indicate lists. Singular names indicate values.
 */
const values = {
  /** An arbitrary function */
  func: console.log,
  string: "",
  symbol: Symbol(),
  numbers: [Number.MAX_VALUE, Number.MIN_VALUE, 0, Infinity, -Infinity],
  bigint: 1n,
  booleans: [true, false],
  objects: [{}, [], new Map(), new Error()],
};

// Separate by type for easier access
const { objects, ...nonObjects } = values;
const { func, ...nonFunctions } = values;
const { string, ...nonStrings } = values;
const { symbol, ...nonSymbols } = values;
const { numbers, ...nonNumbers } = values;
const { booleans, ...nonBooleans } = values;
const { bigint, ...nonBigInts } = values;

/** well-defined values of every primitive type */
const definedVals = flatten(values);
/** values considered ill-defined */
const illDefinedVals = [null, undefined, NaN];

/**
 * Get erroneous test values from object containing invalid values
 *
 * Returned values will include all ill-defined types (null, NaN, undefined)
 * @param invalidTypes contains erroneous values
 * @returns list of erroneous values (ill-defined values + invalidTypes)
 */
const makeErrorCases = (invalidTypes: Object): TestValues => [
  ...illDefinedVals,
  ...flatten(invalidTypes),
];

// Structure tests to iterate through them
/**
 * Each object property name refers to the unit being tested.
 *
 * `error` is list of values that should fail the validation check
 * `valid` is list of values that should pass validation check
 */
const tests: Omit<LibTest, "optional"> = {
  checkIfUndefined: {
    error: [...definedVals, null, NaN],
    valid: [undefined],
  },
  checkIfDefined: { error: illDefinedVals, valid: definedVals },
  checkIfIllDefined: { valid: illDefinedVals, error: definedVals },
  checkIfString: {
    error: makeErrorCases(nonStrings),
    valid: ["", typeof undefined, "0", "1", "{}"],
  },
  checkIfFunction: {
    error: makeErrorCases(nonFunctions),
    valid: [func],
  },
  checkIfNumber: {
    error: makeErrorCases(nonNumbers),
    valid: numbers,
  },
  checkIfSymbol: {
    error: makeErrorCases(nonSymbols),
    valid: [symbol],
  },
  checkIfBigInt: {
    error: makeErrorCases(nonBigInts),
    valid: [bigint],
  },
  checkIfBoolean: {
    error: makeErrorCases(nonBooleans),
    valid: booleans,
  },
  checkIfObject: {
    error: makeErrorCases(nonObjects),
    valid: objects,
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// ─── Test ───────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

describe("type validations", () => {
  Object.entries(tests).forEach(([checkName, cases]) => {
    describe(checkName, () => {
      test("identifies erroneous input", () => {
        cases.error.map(Lib[checkName]).forEach(assertError);
      });
      test("identifies valid input", () => {
        cases.valid.map(Lib[checkName]).forEach(assertValid);
      });
    });
  });
  test("optional check", () => {
    const checkers = {
      valid: jest.fn(() => undefined),
      error: jest.fn(() => "error"),
    };
    const pass = Lib.optional(checkers.valid);
    const fail = Lib.optional(checkers.error);

    [null, undefined, NaN].map(fail).forEach(assertValid); // undefined values pass check regardless of how they would do in the validator
    assertError(fail("a value")); // defined values are validated
    assertValid(pass("a value"));
  });
});
