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

// Validation rules
// return undefined if valid [Typescript void vs undefined returns](https://stackoverflow.com/a/58885486/6656631)
// return error if invalid -- clearer codepaths at cost of minor verbosity (golang)

type Validator = (value) => undefined | unknown;

export function createObjectValidator<Type>(
  validators: Record<keyof Required<Type>, Validator>
): Validator {
  return (obj: Type) => validateObject(obj, validators);
}

// For lists: only one validator. Tuples, use/link to validate object
export function validateObject<Type>(
  obj: Type,
  validators: Record<keyof Required<Type>, Validator>
) {
  if (checkIfObject(obj)) return checkIfObject(obj); // Only tests objects. Catches undefined values

  /**
   * Validates the value (in `obj`) of the given key, using the corresponding validator in `validators`.
   * @param key
   * @returns An object entry, [key, error]: [string, undefined (no errors) | unknown (there were validation errors)]
   */
  function validateKey(key: string): [string, undefined | unknown] {
    const defaultValidator = () => {}; // void validator => no errors, used when no corresponding validator is found for the key
    const validator = validators[key] ?? defaultValidator;
    const valueToTest = obj[key];
    return [key, validator(valueToTest, obj)]; // Pass in entire obj as second param for co-dependency validation
  }
  /**
   * Whether result from `validateKey` is an error.
   * @param tuple Object entry tuple, [key, error]: [string, undefined (no errors) | unknown (there were validation errors)]
   * @returns boolean
   */
  const resultIsError = ([key, value]: [string, unknown]) =>
    value !== undefined;

  const results = Object.keys(validators).map(validateKey);

  const errors = results.filter(resultIsError);
  return errors.length === 0 ? undefined : Object.fromEntries(errors);
}

// list, types, logical combos

export const checkIfDefined = (value) =>
  value === undefined || value === null ? `is ${value}!` : undefined; // Note, to get name of value, wrap input in object

export const makeTypeChecker = (expectedType: string) => (value) =>
  typeof value === expectedType
    ? undefined
    : `Expected type '${expectedType}', got ${typeof value}`;
export const checkIfString = makeTypeChecker("string");
export const checkIfObject = and(checkIfDefined, makeTypeChecker("object"));

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
