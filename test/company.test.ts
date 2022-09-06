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

import { Company, validateCompany } from "./company";
import { assertError, assertValid } from "./common";

describe("boring company test", () => {
  test("valid companies", () => {
    const coms: Company[] = [
      {
        name: {
          display: "pujitm",
        },
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {
          routing_number: "k",
          account_holder_name: "j",
          account_holder_type: "company",
          account_number: "234",
        },
        tos_accepted: true,
      },
    ];
    coms.map(validateCompany).forEach(assertValid);
  });
  test("invalid companies, but valid types", () => {
    const coms: Company[] = [
      {
        name: {
          display: "pujitm",
          legal: "",
        },
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {
          routing_number: "k",
          account_holder_name: "",
          account_holder_type: "company",
          account_number: "",
        },
        tos_accepted: true,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {
          routing_number: "k",
          account_holder_name: "j",
          account_holder_type: "company",
          account_number: "234",
        },
        tos_accepted: false,
      },
    ];
    coms.map(validateCompany).forEach(assertError);
  });
  test("invalid but plausible states", () => {
    const coms = [
      {
        name: {},
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {},
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {},
        tos_accepted: true,
      },
    ] as Company[];
    coms.map(validateCompany).forEach(assertError);
  });
});
