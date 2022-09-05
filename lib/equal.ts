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

/**
 * because some types don't serialize straight to strings (bigint, symbol)
 *
 * Based on https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
 * @param value
 * @returns
 */
function stringify(value) {
  if (typeof value === "bigint" || typeof value === "symbol") {
    return value.toString();
  }
  return `${value}`;
}

/**
 * TODO document
 * TODO rename to `is`?
 *
 * Makes strict equality checker. For primitives only!
 *
 * For objects, collections, and anything incompatible with `===`, use dedicated makeCheckers.
 * ```ts
 * // Usage example
 * const roleIsUser = is('user')
 * const err = roleIsUser(role) // Any value besides 'user' will fail the validation check
 * ```
 * @param expected
 * @returns
 */
export const is = (expected) => (value) =>
  value === expected
    ? undefined
    : `Expected '${stringify(expected)}', got ${stringify(value)}`;
