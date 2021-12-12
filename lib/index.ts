/**
 * A result of a validation check
 */
export interface ValidationResult<ErrorShape = ValidationError> {
  /**
   * Whether the thing you're trying to validate is valid.
   */
  valid: boolean;
  /**
   * Information about why it isn't valid.
   * 
   * Only present if the validation target is invalid.
   * 
   * Customize the `ErrorShape` parameter if:
   * - You want to use a custom error type
   * - And/or you want to specify the metadata shape of the error
   */
  error?: ErrorShape;
}

/**
 * The default structure of a validation error.
 */
export interface ValidationError<MetadataShape = unknown> {
  /**
   * A short indication of the type of error.
   * 
   * This will be application-specific, but some ideas include:
   * - Type Error
   * - Not Allowed/Forbidden (make sure to include *why* in the description)
   * - Time Out (think caching or other forms of time-based/temporal validation)
   */
  category: string;
  /**
   * Why the error happened, and what was expected instead.
   * Oh, and also what the error actually is. That would be helpful too.
   */
  description: string;
  /**
   * Application-specific data you need to go along with your error.
   * 
   * Override the `MetadataShape` type parameter if you plan to use this.
   */
  metadata?: MetadataShape;
}

/**
 * Type signature of a function that checks whether a value (of type @see ValueType ) is valid.
 * 
 * Override Type Parameters to get desired level of specificity.
 */
export type ValidatorFunction<ValueType = unknown, ResultType = ValidationResult> = (value: ValueType) => ResultType;

/**
 * Metadata to help identify and distinguish one validation check from another.
 */
export interface ValidationCheckMetadata {
  /**
   * The name or title of the "check" (i.e. test) that your validator represents.
   */
  name: string;
}

/**
 * Wraps a validation function to help identify and distinguish one validation check from another.
 */
export interface ValidationCheck<ValidatorType = ValidatorFunction> extends ValidationCheckMetadata {
  /**
   * Function to check whether a value is valid.
   * 
   * By default, this is a @see Validator function.
   */
  check: ValidatorType;
}

// build descriptive validator from validation checks

type TypeErrorGenerator;

function makeTypeChecker(type: string): ValidatorFunction {
  return (value: unknown) => {
    if (typeof value !== type)
      return `Expected type "${type}", got type ${typeof value}`;
  };
}

const a = (expectedType, actualType, value) =>
  `Expected type "${expectedType}", got type ${actualType}`;

  // to help name validators
interface ValidatorObj {
    name?: string;
    check: ValidatorFunction;
}