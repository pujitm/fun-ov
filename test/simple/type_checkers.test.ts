// Copyright 2022 Pujit Mehrotra
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** Test type validation checkers */

import * as Lib from "../../lib/simple";
import { assertError, assertValid } from "./common";

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
const tests: LibTest = {
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
});
