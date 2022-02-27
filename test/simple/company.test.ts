// Copyright 2021 Pujit Mehrotra
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
// import { or } from "../../lib/ambiguous";
import { createObjectValidator } from "../../lib/object";
import {
  checkIfString,
  checkIfObject,
  checkIfDefined,
  and,
  or,
} from "../../lib/simple";
import { assertError } from "./common";

interface Account {
  id: string;
}
interface Company {
  name: string;
  bank_account: Account;
}

describe("handles nested objects", () => {
  const checkID = (id: string) => {
    let err = checkIfString(id);
    if (err) return err;

    // ACH regex from https://stackoverflow.com/a/1787814/6656631
    const tester = /^\w{1,17}$/;
    if (!tester.test(id))
      return `Expected 1-17 character alphanumeric. Got ${id}`;
  };

  const validateCompany = createObjectValidator<Company>({
    name: checkIfString, // Should be length greater than 0
    bank_account: createObjectValidator<Account>({ id: checkID }),
  });

  const getResults = (...inputs) => inputs.map(validateCompany);
  const expectSuccess = (...results) =>
    results.forEach((result) => expect(result).toBeUndefined());
  const expectFailure = (...results) => results.forEach(assertError);
  const testCases = (expector, cases: unknown[]) =>
    expector(...getResults(...cases));

  test("recognizes valid results", () => {
    const cases: Company[] = [
      {
        name: "hi",
        bank_account: { id: "iii" },
      },
      {
        name: "z",
        bank_account: { id: "i" },
      },
      {
        name: "hi z",
        bank_account: { id: "123456789abcdefgh" }, // 17 characters, alphanumeric
      },
    ];
    expectSuccess(...getResults(...cases));
  });

  test("empty top-level input", () => {
    testCases(expectFailure, [undefined, null, {}]);
  });

  test("missing fields", () => {
    testCases(expectFailure, [
      {}, // No fields
      { name: "ee" }, // no account
      {
        // No name and empty account
        bank_account: {},
      },
      {
        // No name
        bank_account: { id: "ss" },
      },
      { name: "doesnt matter", bank_account: {} }, // empty account
    ]);
  });
});
