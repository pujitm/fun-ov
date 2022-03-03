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

/** Test fundamental library components */

import { and, or } from "../../lib/combinators";
import * as Lib from "../../lib/simple";
import { assertError, assertValid } from "./common";

type ValidationResult = "error" | "valid";
type Cases = Record<ValidationResult, unknown[]>;
type LibTest = Record<keyof typeof Lib, Cases>; // Ensure coverage

const flatten = (obj: Object) => Object.values(obj).flat();

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

const makeError = (nonTypes: Object) => [
  ...illDefinedVals,
  ...flatten(nonTypes),
];

const tests: LibTest = {
  checkIfUndefined: { error: [...definedVals, null, NaN], valid: [undefined] },
  checkIfDefined: { error: illDefinedVals, valid: definedVals },
  checkIfIllDefined: { valid: illDefinedVals, error: definedVals },
  checkIfString: {
    error: makeError(nonStrings),
    valid: ["", typeof undefined],
  },
  checkIfFunction: {
    error: makeError(nonFunctions),
    valid: [func],
  },
  checkIfNumber: {
    error: makeError(nonNumbers),
    valid: numbers,
  },
  checkIfSymbol: {
    error: makeError(nonSymbols),
    valid: [symbol],
  },
  checkIfBigInt: {
    error: makeError(nonBigInts),
    valid: [bigint],
  },
  checkIfBoolean: {
    error: makeError(nonBooleans),
    valid: booleans,
  },
  checkIfObject: {
    error: makeError(nonObjects),
    valid: objects,
  },
};

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

describe("logical operators", () => {
  // TODO Eager, lazy
  // TODO pass additional params through
  // TODO Logic tests - truth table
  // deliberately not implementing 'not' for clearer combination logic, clarity over concision
  // technically, logical combinators are fundamentals, and type checks are built on top of them
  test("and validator", () => {
    // TODO make value equator check ie. (i) => i === "hi"
    const validator = and(Lib.checkIfDefined, (input) =>
      input === "hi" ? undefined : `expected 'hi', got ${JSON.stringify(input)}`
    );
    [null, undefined, {}, "", "HI"].map(validator).forEach(assertError);
    assertValid(validator("hi"));
  });

  test("or validator", () => {
    // TODO make value equator check ie. (i) => i === "hi"
    const validator = or(Lib.checkIfString, Lib.checkIfObject);
    [null, undefined, NaN, 0, 1].map(validator).forEach(assertError);
    [{}, "", "HI", [], { hi: "" }, ["hi"]].map(validator).forEach(assertValid);
  });
});
