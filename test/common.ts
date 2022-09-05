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

import { resultIsError } from "../lib/rules";

/**
 * Asserts that the result of a validation check is erroneous
 * @param result
 */
export const assertError = (result) => {
  expect(result).toBeDefined();
  expect(resultIsError(result)).toBeTruthy();
};

/**
 * Asserts that the result of a validation check is not erroneous
 * @param result
 */
export const assertValid = (result) => {
  expect(result).toBeUndefined();
};
