/**
 * because some types don't serialize straight to strings (bigint, symbol)
 *
 * Based on https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
 * @param value
 * @returns
 */
function stringify(value) {
  if (typeof value === "bigint" || typeof value === "symbol") {
    return value.toString();
  }
  return `${value}`;
}

// TODO document better
/**
 * Makes strict equality checker. For primitives only!
 *
 * For objects, collections, and anything incompatible with `===`, use dedicated makeCheckers.
 * ```ts
 * // Usage example
 * const roleIsUser = is('user')
 * const err = roleIsUser(role) // Any value besides 'user' will fail the validation check
 * ```
 * @param expected
 * @returns
 */
export const is = (expected) => (value) =>
  value === expected
    ? undefined
    : `Expected '${stringify(expected)}', got ${stringify(value)}`;
