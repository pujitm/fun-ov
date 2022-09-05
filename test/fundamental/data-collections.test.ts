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

/** For belabored proof of functionality/regression checks */

import { createObjectValidator } from "../../lib/object";
import { checkIfString } from "../../lib/simple";
import { assertError, assertValid } from "../common";

interface Account {
  id: string;
}
interface Company {
  name: string;
  bank_account: Account;
}

describe("handles nested objects", () => {
  const checkID = (id: string) => {
    let err = checkIfString(id); // can also use `and(checkIfString, ...)`, but types are ambiguous (currently)
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

  const testCases = (assertor, cases: unknown[]) =>
    cases.map(validateCompany).forEach(assertor);
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
    testCases(assertValid, cases);
  });

  test("validation is flexible!", () => {
    // Can add features/properties without breaking existing checks
    testCases(assertValid, [
      {
        name: "fun-ov",
        bank_account: { id: "1234", created: 144785, balance: 2 },
        ein: "an ein",
        incorporated: new Date(),
        status: "delinquent",
        comments: ["nXhb", "wee3kfjmG"],
      },
    ]);
  });

  test("empty top-level input", () => {
    testCases(assertError, [undefined, null, {}]);
  });

  test("missing fields", () => {
    testCases(assertError, [
      {}, // No fields
      { name: null },
      { bank_account: null },
      { name: null, bank_account: null },
      { name: "ee" }, // no account
      { name: "ee", bank_account: null },
      { name: "doesnt matter", bank_account: {} }, // empty account
      {
        // No name
        bank_account: { id: "ss" },
      },
      {
        name: null,
        bank_account: { id: "ss" },
      },
      {
        // No name and empty account
        bank_account: {},
      },
      {
        bank_account: { id: null },
      },
      {
        // missing inner prop
        name: "fun-ov",
        bank_account: { id: null },
      },
    ]);
  });
  test("malformed fields", () => {
    testCases(assertError, [
      // Malformed Inner Prop - ID
      {
        name: "fun-ov",
        bank_account: { id: 123456 },
      },
      {
        name: "fun-ov",
        bank_account: { id: "" },
      },
      {
        name: "fun-ov",
        bank_account: { id: "123456789abcdefghi" }, // len = 18, too long
      },
      // Malformed Bank Account
      {
        name: "fun-ov",
        bank_account: 123,
      },
      {
        name: "fun-ov",
        bank_account: [123],
      },
      {
        name: "fun-ov",
        bank_account: 0,
      },
      {
        name: "fun-ov",
        bank_account: true,
      },
      {
        name: "fun-ov",
        bank_account: { ID: "1234" },
      },
    ]);
  });
});
