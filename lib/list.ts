/** Validation for lists and list-like structures (tuples) */

import { validationEntryIsError } from "./object";
import { resultIsError, Validator } from "./rules";
import { checkIfObject } from "./type-checks";

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
 * const validateCart = makeListChecker(validateCartItem);
 * const validateDynamicList = makeListChecker(or(checkIfString, checkIfNumber, customCheck));
 * const checkBoundedValues = makeListChecker(and(checkIfNumber, (item, index, list) => {
 *    if (item > list.length) return `exceeds limit ${list.length}`
 *    if (item < index) return `lower than limit ${index}`
 * }));
 * ```
 * Often used with @see makeObjectChecker to validate list/array fields
 * @param validator
 * @returns `undefined` if no errors. Else, an object where [key, value] -> [index of erroneous element, error from validator]
 */
export function makeListChecker<Type>(validator: Validator<Type>) {
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

export type GenericTuple = [...unknown[]];

/**
 * Returns a tuple validator that:
 *
 * TODO document usage
 * @param validators validators for each element in tuple
 * @returns
 */
export function makeTupleChecker<TupleType extends GenericTuple>(
  ...validators: Validator[]
) {
  return (tuple: TupleType) => checkTuple(validators, tuple);
}

function checkTuple<Tuple extends GenericTuple>(
  validators: Validator[],
  tuple: Tuple
) {
  if (checkIfObject(tuple)) return checkIfObject(tuple); // tuples appear as lists, which are objects in javascript
  if (tuple.length !== validators.length)
    return `expected tuple of ${validators.length} elements, got tuple of ${tuple.length}`;

  const results = tuple.map((input, index, entireTuple) => {
    const itemValidator = validators[index];
    return itemValidator(input, index, entireTuple);
  });
  return getErrors(results);
}

/**
 * Returns any errors from `results` in object form.
 * @param results list of results from validation checks
 * @returns If error in `results`: object [key, value] -> [index of error, error]. Else, undefined.
 */
function getErrors(results: (unknown | undefined)[]): ErrorsInList {
  if (results.some(resultIsError)) {
    // Filter last--after creating entries--to preserve indexes
    const errors = Object.entries(results).filter(validationEntryIsError);
    // It would be simpler to return the entire list of results, but
    // it's redundant, verbose, and expensive (ie. larger lists - imagine logging or printing all of that dead/useless data).
    // Unmapped entries/entries not in this object are implicitly valid
    return Object.fromEntries(errors);
  }
}
