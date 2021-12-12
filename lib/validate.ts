// Copyright 2021 Pujit Mehrotra
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

function setupValidationResolution<ValidationResultType>(
  makeValidationResult: (results: {
    [key: string]: ValidationResultType;
  }) => ValidationResultType
) {
  // I toyed with the idea of accepting this function in one of the functions in the return chain below,
  // but I decided not to and chose to add another layer to the chain. First, I'll explain why I didn't accept it in the chain below.
  //
  // Accepting the injection in makeObjectValidator would result in repeat boilerplate code when defining validators for nested objects
  // Similarly, I realized that the final function returned had to conform to a ValidatorFunction to support nested objects.
  // It would still support nesting if I accepted it as an option parameter with a default, but I decided against that for several reasons:
  // - I would have to assume a default value/implementation of the function, or I would have to get it somewhere else (one of those 'somewhere else's' being up the return chain)
  // - Multiple areas/Options for injecting this behavior would lead to confusion in teams and during development.
  // - Adding it through a top layer, however, made more sense the more I thought about it.
  //
  // The fact is that different modules/parts of a solution will prefer different behavior in this module.
  // For instance, at web API level, where the server wants to validate data coming from a client, the ValidationResult may be an object that includes an http code,
  // but other layers might find the code redundant/unnecessary and prefer to use a different data type, even something as simple as a string.
  // this top layer, then, allows developers to scope/adjust that behavior as needed while minimizing boilerplate.
  // it's kinda like a factory.
  //
  // Originally, this parameter was `resultIsError: (result: ValidationResultType) => boolean`, and I filtered for erroneous validation results.
  // If the collection of errors wasn't empty, I knew the validation discovered errors. The problem was that I didn't know how to format that information
  // to conform to the variable ValidationResultType.
  // Since i needed to know how to format the results into a single result anyway, I decided against keeping the original parameter.
  // It defined behavior more than it needed to.
  // I also decided to pass in all validation results (to the makeValidationResult function, see the bottom of the chain) instead of just the errors (eliminating the need for the former parameter).
  // This way, the user (of this library) has all of the validation results and can format them as needed.

  return function makeObjectValidator<ObjectShape>(
    // validator has same keys as object shape, except they refer to validator functions instead of the values
    // TODO in keyof Required<ObjectShape> ?
    // defined verbosely (without PropertyValidator) to provide type safety & editor completion/suggestions during use
    validator: {
      [key in keyof ObjectShape]: (
        value: ObjectShape[key]
      ) => ValidationResultType;
    }
  ) {
    type PropertyValidator = (
      value: ObjectShape[keyof ObjectShape]
    ) => ValidationResultType;
    // To support nested objects, the final returned function must be a ValidatorFunction
    // returns list of errors in object
    return function validateObject(object: ObjectShape): ValidationResultType {
      // i don't think this needs to be a dependency b/c it's common behavior, but it can be if necessary
      // needs to be refactored -- shit code
      const validatePropertyInObject = ([key, validate]: [
        string,
        PropertyValidator
      ]) => {
        const property = object[key];
        return [key, validate(property)];
      };

      const resultPairs = Object.entries<PropertyValidator>(validator).map(
        validatePropertyInObject
      );

      const validationResults = Object.fromEntries(resultPairs);
      return makeValidationResult(validationResults);
    };
  };
}
