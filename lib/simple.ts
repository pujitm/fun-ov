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

import { and } from "./combinators";

// list, types, logical combos
// should export checks for all primitive types listed at
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#javascript_types

/**
 * Utility to make functions that:
 * Check whether the `typeof` their input matches the `expectedType`
 * @param expectedType
 * @returns `(input:any) => string | undefined`
 */
const makeTypeChecker = (expectedType: string) => (value) =>
  typeof value === expectedType
    ? undefined
    : `Expected type '${expectedType}', got ${typeof value}`;

/**
 * Checks whether `typeof input` is `undefined`
 *
 * Note that `null` and `NaN` are distinct values that do not have a `typeof` undefined.
 *
 * From [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined):
 * - A variable that has not been assigned a value is of type undefined.
 * - A method or statement also returns undefined if the variable that is being evaluated does not have an assigned value.
 * - A function returns undefined if a value was not returned.
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfUndefined = makeTypeChecker("undefined");

/**
 * Checks whether input is well-defined.
 *
 * ie. not undefined, null, or NaN
 * @param value any value
 * @returns error string if `value` is not well-defined
 */
export const checkIfDefined = (value) => {
  const illDefinedVals = [null, undefined, NaN];
  if (illDefinedVals.includes(value)) return `is ${value}!`;
};

/**
 * Checks whether value is undefined, null, or NaN
 * @param value
 * @returns string if value is not undefined, null, or NaN
 */
export const checkIfIllDefined = (value) => {
  const err = checkIfDefined(value);
  if (!err) {
    try {
      return `expected ill-defined value, got ${value}`;
    } catch (castError) {
      // Input value may be something that can't implicitly turn into a string
      // ie. symbol, or more likely, bigint
      return `expected ill-defined value, got ${typeof value}`;
    }
  }
};

/**
 * Checks whether `typeof input` is `string`
 *
 * From [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type):
 * JavaScript's String type is used to represent textual data.
 * It is a set of "elements" of 16-bit unsigned integer values.
 * @param input unknown input value to check
 * @returns string, if `input` is not of the expected type
 */
export const checkIfString = makeTypeChecker("string");
/**
 * Checks whether `typeof input` is [`function`](https://developer.mozilla.org/en-US/docs/Glossary/Function)
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfFunction = makeTypeChecker("function");
/**
 * Checks whether `typeof input` is `number`
 *
 * From [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type):
 * The Number type is a double-precision 64-bit binary format IEEE 754 value (numbers between -(2^53 − 1) and 2^53 − 1).
 *
 * In addition to representing floating-point numbers, the number type has three symbolic values: +Infinity, -Infinity, and NaN ("Not a Number").
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfNumber = and(checkIfDefined, makeTypeChecker("number"));
/**
 * Checks whether `typeof input` is [`symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#symbol_type)
 *
 * Note: Symbol was introduced in ECMAScript 2015
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfSymbol = makeTypeChecker("symbol");
/**
 * Checks whether `typeof input` is [`bigint`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type)
 *
 * Note: BigInt was introduced in ECMAScript 2020
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfBigInt = makeTypeChecker("bigint");
/**
 * Checks whether `typeof input` is `boolean`
 *
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfBoolean = makeTypeChecker("boolean");
/**
 * Checks whether `typeof input` is `object`
 *
 * From [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects):
 * In JavaScript, objects can be seen as a collection of properties.
 *
 * Property values can be values of any type, including other objects, which enables building complex data structures.
 *
 * Properties are identified using key values. A key value is either a String value or a Symbol value.
 *
 * Note: used in fun-ov data structure validators, like @see createObjectValidator & @see createListChecker
 * @param input
 * @returns string, if `input` is not of the expected type
 */
export const checkIfObject = and(checkIfDefined, makeTypeChecker("object"));
