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
import { checkIfDefined, checkIfObject, checkIfString } from "../../lib/simple";
import { assertError, assertValid } from "./common";

describe("type checkers", () => {
  test("check if defined", () => {
    [null, undefined, NaN].map(checkIfDefined).forEach(assertError);

    [{}, "", false, 0, [], Infinity].map(checkIfDefined).forEach(assertValid);
  });
  describe("check if object", () => {
    test("identifies objects", () => {
      [{}, [], new Map(), new Error()].map(checkIfObject).forEach(assertValid);
    });

    describe("returns error", () => {
      test("for ill-defined values", () => {
        [null, undefined, NaN].map(checkIfObject).forEach(assertError);
      });
      test("for non-objects", () => {
        [0, Infinity, "", () => {}].map(checkIfObject).forEach(assertError);
      });
    });
  });
});

describe("logical operators", () => {
  test("and validator", () => {
    // TODO make value equator check ie. (i) => i === "hi"
    const validator = and(checkIfDefined, (input) =>
      input === "hi" ? undefined : `expected 'hi', got ${JSON.stringify(input)}`
    );
    [null, undefined, {}, "", "HI"].map(validator).forEach(assertError);
    assertValid(validator("hi"));
  });

  test("or validator", () => {
    // TODO make value equator check ie. (i) => i === "hi"
    const validator = or(checkIfString, checkIfObject);
    [null, undefined, NaN, 0, 1].map(validator).forEach(assertError);
    [{}, "", "HI", [], { hi: "" }, ["hi"]].map(validator).forEach(assertValid);
  });
});
