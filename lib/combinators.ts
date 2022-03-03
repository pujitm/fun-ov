import { Validator } from "./rules";

// eager vs lazy
export function and(...validators: Validator[]): Validator {
  return (value, ...additionalInfo): undefined | unknown[] => {
    const results = validators.map((check) => check(value, ...additionalInfo));
    // Erroneous results must be truthy, so keep truthy results
    const errors = results.filter((err) => err);
    if (errors.length > 0) {
      return errors;
    }
  };
}

export function or(...validators: Validator[]): Validator {
  return (value, ...additionalInfo): undefined | unknown[] => {
    const results = validators.map((check) => check(value, ...additionalInfo));
    const errors = results.filter((err) => err);
    if (errors.length === results.length) {
      // No check succeeded
      return errors;
    }
  };
}
