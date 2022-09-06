// Validation rules
// return undefined if valid [Typescript void vs undefined returns](https://stackoverflow.com/a/58885486/6656631)
// return error if invalid -- clearer codepaths at cost of minor verbosity (golang)

/**
 * A function that validates an input value
 *
 * @returns `undefined` (ie no return value) if valid, or an error if invalid
 */
export type Validator<Input = unknown, Error = unknown> = (
  value: Input,
  ...params // Arbitrary parameters. Usually unused. Useful for co-dependencies/business logic within data structures
) => undefined | Error;

/**
 * @param error Result of a `Validator` check
 * @returns Whether the result of a validation check is erroneous
 */
export const resultIsError = (error) => error !== undefined;
