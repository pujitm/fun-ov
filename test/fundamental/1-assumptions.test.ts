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

import { assertError, assertValid } from "../common";

describe("assumptions about JS Behavior", () => {
  test("empty values are truthy", () => {
    [{}, []].forEach((v) => expect(v).toBeTruthy());
  });
  test("ill defined values are falsy", () => {
    [null, undefined, NaN].forEach((v) => expect(v).toBeFalsy());
  });
});

describe("fundamental (default) validation rules", () => {
  describe("validation checks", () => {
    test("truthy results mean error", () => {
      [{}, []].forEach(assertError);
      [1, -1, Infinity, true].forEach(assertError);
    });

    test("falsy values mean error too", () => {
      ["", 0, false].forEach(assertError);
    });

    test("ill-, but not un-, defined values mean failure", () => {
      [null, NaN].forEach(assertError);
    });

    test("*only* undefined means success/valid", () => {
      const emptyFunction = function () {};
      [undefined, emptyFunction()].forEach(assertValid);
    });
  });
});
