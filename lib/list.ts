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

/**
 * Usage:
 *
 * 1. Create a list validator function:
 * ```ts
 * const validateCart = checkList(checkCartItem);
 * const errors = validateCart(items);
 * ```
 *
 * 2. Validate a list
 * ```ts
 * const errors = checkList(checkCartItem, items)
 * if (errors) {
 *      // do something
 * }
 * ```
 * @param validator
 * @param list
 * @returns (with list) object mapping indices to errors at them, (without list) a list validator function
 */
export function checkList<Type>(validator: Validator<Type>, list?: Type[]) {
  // Act as curry/composer if no list is given
  if (!list) return (futureList: Type[]) => checkList(validator, futureList);
  if (checkIfObject(list)) return checkIfObject(list);

  // TODO document passing of index and entire list (if that is desired behavior)
  const results = list.map(validator);
  if (results.some(resultIsError)) {
    const errors = Object.entries(results).filter(validationEntryIsError);
    return Object.fromEntries(errors);
  }
}

export type GenericTuple = [...unknown[]];

// export function checkTuple<Type extends GenericTuple>(
//   validators: Validator[],
//   tuple?: Type
// ) {
//   if (!tuple) return (futureTuple: Type) => checkTuple(validators, futureTuple);
//   if (checkIfObject(tuple)) return checkIfObject(tuple);

//   tuple.forEach((input, index) => {
//       const validator
//   })
// }
