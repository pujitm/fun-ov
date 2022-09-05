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

import { and, EagerAnd, EagerOr, or } from "../../lib/combinators";
import { assertError, assertValid } from "./common";

describe("logical operators", () => {
  const makeMockCheckers = () => ({
    valid: jest.fn(() => undefined),
    error: jest.fn(() => "error"),
  });
  const input = "anything";
  function testAnd(and) {
    return () => {
      const checkers = makeMockCheckers();
      assertValid(and(checkers.valid, checkers.valid)(input));
      assertError(and(checkers.valid, checkers.error)(input));
      assertError(and(checkers.error, checkers.valid)(input));
      assertError(and(checkers.error, checkers.error)(input));
    };
  }
  function testOr(or) {
    return () => {
      const checkers = makeMockCheckers();
      assertError(or(checkers.error, checkers.error)(input));
      assertValid(or(checkers.valid, checkers.error)(input));
      assertValid(or(checkers.error, checkers.valid)(input));
      assertValid(or(checkers.valid, checkers.valid)(input));
    };
  }
  test("and validator (logical conjuction)", testAnd(and));

  test("or validator (logical disjunction)", testOr(or));
  test("EagerAnd works", testAnd(EagerAnd));
  test("EagerOr works", testOr(EagerOr));
  test("EagerAnd is Eager", () => {
    let checkers = makeMockCheckers();
    const refreshCheckers = () => (checkers = makeMockCheckers());

    EagerAnd(checkers.error, checkers.valid)(input);
    expect(checkers.valid).toBeCalledTimes(1);
    refreshCheckers();

    EagerAnd(checkers.error, checkers.error)(input);
    expect(checkers.error).toBeCalledTimes(2);
  });
  test("EagerOr is Eager", () => {
    let checkers = makeMockCheckers();
    const refreshCheckers = () => (checkers = makeMockCheckers());

    EagerOr(checkers.valid, checkers.valid)(input);
    expect(checkers.valid).toBeCalledTimes(2);
    refreshCheckers();

    EagerOr(checkers.valid, checkers.error)(input);
    expect(checkers.error).toBeCalledTimes(1);
  });
});
