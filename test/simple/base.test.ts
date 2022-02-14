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

import {
  checkIfDefined,
  checkIfObject,
  checkIfString,
  or,
  and,
} from "../../lib/simple";
import { assertError, assertValid } from "./common";

describe("type checkers", () => {
  test("check if defined", () => {
    [null, undefined].map(checkIfDefined).forEach(assertError);

    // TODO Should NaN be considered undefined?
    [{}, "", false, NaN, 0, []].map(checkIfDefined).forEach(assertValid);
  });
  test("check if object", () => {
    const results = [null, undefined, "", NaN, 1].map(checkIfObject);
    results.forEach(assertError);
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
