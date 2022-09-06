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

import { resultIsError, Validator } from "./rules";
import { checkIfObject } from "./type-checks";

// ─── Meta ───────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

// Naming: make___Checker over create___Validator to save characters & syllables. More clear too.

// Keeping this API (1. create -> 2. validate) because:
// 1. Easier to maintain backwards compatibility
// 2. Clearer than polymorphic alternative (use validateObject for composition and action)
// Drawbacks of verbosity/inelegance are worth it.
//
// Polymorphic approach (checkList function) would allow both uses:
//
//   1. Create a list validator function:
//   ```ts
//   const validateCart = checkList(checkCartItem);
//   const errors = validateCart(items);
//   ```
//
//   2. Validate a list
//   ```ts
//   const errors = checkList(checkCartItem, items)
//   if (errors) {
//        // do something
//   }
//   ```
// I could see it being confusing (when/why to use one over the other).

// ────────────────────────────────────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────── End Meta ─────

/**
 * Compose validators of object members to validate the object itself.
 *
 * Note: each child validator will have access to a second parameter, the input object being validated,
 * to help with co-dependent logic.
 *
 * Example - set up type validators to use at runtime:
 * ```ts
 * // setup.ts
 * type Action = 'like' | 'comment' | 'subscribe';
 *
 * type CommentParams = { body: string };
 * // The type parameter ensures each key has a validator (to keep validators up-to-date with code changes)
 * // You can provide type parameters to individual component validators for even stronger type checking
 * const validateCommentParams = makeObjectChecker<CommentParams>({ body: checkIfString });
 *
 * export interface ExpectedAPIRequest {
 *    target: string; // an id string
 *    action: Action;
 *    params?: CommentParams;
 * }
 *
 * const checkAction = or(is('like'), is('comment'), is('subscribe'));
 * const checkParams = (params: CommentParams, requestObject: ExpectedAPIRequest) => {
 *    // ignore field if action is like or subscribe
 *    // b/c they only need the target id to perform their action
 *    if (requestObject.action === "comment") {
 *        return validateCommentParams(params);
 *    }
 * };
 *
 * export const validateAPIRequest = makeObjectChecker<ExpectedAPIRequest>({
 *    target: checkIfString,
 *    action: checkAction,
 *    params: optional(checkParams),
 * });
 * ```
 * Usage:
 * ```ts
 * import { validateAPIRequest, ExpectedAPIRequest } from './setup'
 * export const handler = (req, res) => {
 *    const errors = validateAPIRequest(req.body as ExpectedAPIRequest);
 *    if (errors) {
 *        // Status code could be derived from the error. By default, errors are formatted as strings in fun-ov
 *        const BAD_REQUEST = 400;
 *        return res.status(BAD_REQUEST).json({ errors });
 *    }
 * }
 * ```
 * @param validators validators for each key in `Type`
 * @returns `Validator<Type>` - single/unified validator for an object of `Type`
 */
export function makeObjectChecker<Type>(
  validators: Record<keyof Required<Type>, Validator>
): Validator<Type> {
  return (obj: Type) => validateObject(obj, validators);
}

/**
 * Ensures input is a defined object. Then uses validators to validate input object.
 *
 * Not exported/exposed b/c I couldn't think of a use-case where it would be
 * clearly and distinctly preferable to @see makeObjectChecker and I wanted to avoid
 * causing confusion/ambiguity of use.
 *
 * It can also be reached/recreated via `makeObjectChecker(validators)(input);`
 * The trade between concision and clarity seems worth it.
 *
 * It may be helpful where validators aren't known ahead of time, but even that scenario doesn't require
 * this function, because at some level, validators must be defined ahead of time.
 *
 * Also, it's an easy feature addition for the future.
 *
 * @param input something that should be a valid `Type`
 * @param validators logic to define what a valid `Type` is
 * @returns undefined if input is valid. A string if input is not a defined object. Else, an object containing each erroneous key mapped to its error(s).
 */
function validateObject<Type>(
  input: Type,
  validators: Record<keyof Required<Type>, Validator>
) {
  if (checkIfObject(input)) return checkIfObject(input); // Only tests objects. Catches undefined values

  const validateKey = makeKeyValidator(input, validators);
  const results = Object.keys(validators).map(validateKey);
  const errors = results.filter(validationEntryIsError);

  if (errors.length > 0) return Object.fromEntries(errors);
}

/**
 * Convenience function. Used when simplifying to resultIsError is undesirable (@see makeListChecker).
 * @param tuple Object entry tuple, [key, error]:
 * - tuple[0] - string: the object key
 * - tuple[1] - undefined (no errors) | unknown (there were validation errors)
 * @returns Whether result from `validateKey` is an error
 */
export const validationEntryIsError = ([key, value]: [string, unknown]) =>
  resultIsError(value);

/**
 * Returns a function that validates the value (in `obj`) of the given key, using the corresponding validator in `validators`:
 * @param key
 * @returns An object entry, [key, error]: [string, undefined (no errors) | unknown (there were validation errors)]
 */
function makeKeyValidator<Type>(
  obj: Type,
  validators: Record<keyof Required<Type>, Validator>
) {
  return function (key: string): [string, undefined | unknown] {
    const defaultValidator = () => {}; // void validator => no errors, used when no corresponding validator is found for the key
    const validate = validators[key] ?? defaultValidator;
    const valueToTest = obj[key];
    return [key, validate(valueToTest, obj)]; // Pass in entire obj as second param for co-dependency validation
  };
}
