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

import { Validator } from "./rules";

// list, types, logical combos

export const checkIfDefined = (value) => {
  const illDefinedVals = [null, undefined, NaN];
  return illDefinedVals.includes(value) ? `is ${value}!` : undefined;
};

export const makeTypeChecker = (expectedType: string) => (value) =>
  typeof value === expectedType
    ? undefined
    : `Expected type '${expectedType}', got ${typeof value}`;
export const checkIfString = makeTypeChecker("string");
export const checkIfObject = and(checkIfDefined, makeTypeChecker("object"));

// eager vs lazy
export function and(...validators: Validator[]): Validator {
  return (value): undefined | unknown[] => {
    const results = validators.map((check) => check(value));
    // Erroneous results must be truthy, so keep truthy results
    const errors = results.filter((err) => err);
    if (errors.length > 0) {
      return errors;
    }
  };
}

export function or(...validators: Validator[]): Validator {
  return (value): undefined | unknown[] => {
    const results = validators.map((check) => check(value));
    const errors = results.filter((err) => err);
    if (errors.length === results.length) {
      // No check succeeded
      return errors;
    }
  };
}
