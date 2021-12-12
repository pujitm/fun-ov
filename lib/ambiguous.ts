export type Validator = (value: unknown) => boolean;

export const makeTypeChecker = (expectedType: string): Validator => (value) =>
  typeof value === expectedType;

export const isUndefined = makeTypeChecker("undefined");
export const isString = makeTypeChecker("string");
export const isNumber = makeTypeChecker("number");
export const isObject = makeTypeChecker("object");
export const isBoolean = makeTypeChecker("boolean");

/**
 * Value to validate is optionally defined. i.e. the value may be undefined.
 * @param validators Only run if the (future) input value is defined.
 * @returns
 */
export const optional = (...validators: Validator[]): Validator =>
  or(isUndefined, ...validators);

export function createValidator<Type>(
  validators: Record<keyof Required<Type>, Validator>
) {
  const defaultValidator = () => true;
  const keyValuePairIsValid = (key: string, value: unknown) => {
    const validator = validators[key] ?? defaultValidator;
    return validator(value);
  };

  return (obj: Type) =>
    Object.keys(validators).every((key) => keyValuePairIsValid(key, obj[key]));
}

/**
 * Returns `true` if one of the checks pass.
 *
 * Consolidates a group of validation checks into a single check.
 * Lazily runs validation checks in sequential order. Validates quickly, but invalidates slowly.
 * @param validators Checker functions to help determine if an input is valid
 * @returns Whether at least one of the checks is valid.
 */
export function or(...validators: Validator[]): Validator {
  return (value) => validators.some((isValid) => isValid(value));
}

/**
 * Returns `true` if all checks pass.
 *
 * Consolidates a group of validation checks into a single check.
 * Lazily runs validation checks in sequential order. Invalidates quickly, validates slowly.
 * @param validators Checker functions to help determine if an input is valid
 * @returns Whether at least one of the checks is valid.
 */
export function and(...validators: Validator[]): Validator {
  return (value) => validators.every((isValid) => isValid(value));
}
