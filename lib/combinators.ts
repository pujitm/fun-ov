import { resultIsError, Validator } from "./rules";

// ─── Lazy Logic ─────────────────────────────────────────────────────────────────

export function and(...validators: Validator[]): Validator {
  return (...validationParams): unknown => {
    for (const check of validators) {
      const result = check(...validationParams);
      if (resultIsError(result)) return result;
    }
  };
}

export function or(...validators: Validator[]): Validator {
  return (...validationParams): unknown[] => {
    const errors = [];
    for (const check of validators) {
      const result = check(...validationParams);
      if (!resultIsError(result)) return;
      else errors.push(result);
    }
    return errors;
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// deliberately not implementing 'not' for clearer combination logic, clarity over concision
// technically, logical combinators are fundamentals, and type checks are built on top of them
//
// Naming? Capitalization. and vs all, or vs any.
// ────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// ─── Eager Logic ────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

type ErrorMaker<ErrorType = unknown[]> = (
  results: unknown[],
  errors: unknown[]
) => ErrorType;

function makeEagerCombinator(makeError: ErrorMaker) {
  return (...validators: Validator[]): Validator => {
    return (...validationParams) => {
      const results = validators.map((check) => check(...validationParams));
      // TODO group errors into object (like list checkers) for clarity into which validations failed?
      const errors = results.filter(resultIsError);
      return makeError(results, errors);
    };
  };
}

export const EagerAnd = makeEagerCombinator((_, errors) => {
  if (errors.length > 0) {
    return errors;
  }
});

export const EagerOr = makeEagerCombinator((results, errors) => {
  if (errors.length === results.length) {
    // No check succeeded
    return errors;
  }
});
