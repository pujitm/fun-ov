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

import { validationEntryIsError } from "./object";
import { resultIsError, Validator } from "./rules";
import { checkIfObject } from "./simple";

// TODO add explicit return types to exposed api
// at least the convenience lib funcs like checkIfObject (so ts has something better than unknown)
// remember, strings are returned if initial type checks are erroneous
type ErrorsInList = Record<number, unknown>;

/**
 * Returns a function that:
 *
 * Takes a list and validates every element with `validator`.
 *
 * Note: `validator` will have access to 2 additional parameters:
 * element index (number) & the entire array (Type[])
 *
 * Example - set up type validators to use at runtime:
 * ```ts
 * const validateCart = createListChecker(validateCartItem);
 * const validateDynamicList = createListChecker(or(checkIfString, checkIfNumber, customCheck));
 * const checkBoundedValues = createListChecker(and(checkIfNumber, (item, index, list) => {
 *    if (item > list.length) return `exceeds limit ${list.length}`
 *    if (item < index) return `lower than limit ${index}`
 * }));
 * ```
 * Often used with @see createObjectValidator to validate list/array fields
 * @param validator
 * @returns `undefined` if no errors. Else, object [key, value] -> [index of erroneous element, error from validator]
 */
export function createListChecker<Type>(validator: Validator<Type>) {
  return (list: Type[]) => checkList(validator, list);
}

/**
 * Ensures list is a defined object. Then validates every list element with validator
 *
 * @param validateElement has access to element `index` and entire `list` as 2nd and 3rd parameters
 * @param list
 * @returns (if error) object mapping indices to errors at them
 */
function checkList<Type>(validateElement: Validator<Type>, list: Type[]) {
  if (checkIfObject(list)) return checkIfObject(list); // lists are objects in javascript

  const results = list.map(validateElement);
  return getErrors(results);
}

// TODO checkMap? include why use map over object

export type GenericTuple = [...unknown[]];

/**
 * Returns a tuple validator that:
 * 
 * TODO document usage
 * @param validators validators for each element in tuple
 * @returns 
 */
export function createTupleChecker<TupleType extends GenericTuple>(...validators: Validator[]) {
  return (tuple: TupleType) => checkTuple(validators,tuple)
}

function checkTuple<Tuple extends GenericTuple>(
  validators: Validator[],
  tuple: Tuple
) {
  if (checkIfObject(tuple)) return checkIfObject(tuple); // tuples appear as lists, which are objects in javascript
  if (validators.length !== tuple.length)
    return `expected tuple of ${validators.length} elements, got tuple of ${tuple.length}`;

  const results = tuple.map((input, index) => validators[index](input));
  return getErrors(results);
}

/**
 * Returns any errors from `results` in object form.
 * @param results list of results from validation checks
 * @returns If error in `results`: object [key, value] -> [index of error, error]. Else, undefined.
 */
function getErrors(results: (unknown | undefined)[]): ErrorsInList {
  if (results.some(resultIsError)) {
    const errors = Object.entries(results).filter(validationEntryIsError);
    // It would be simpler to return the entire list of results, but
    // it's redundant, verbose, and expensive (ie. larger lists - imagine logging or printing all of that dead/useless data).
    // Unmapped entries are implicitly valid
    return Object.fromEntries(errors);
  }
}
