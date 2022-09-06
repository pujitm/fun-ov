# Functional Object Validation for Typescript and Javascipt

Fun-ov makes runtime validation easy, flexible, and maintainable at scale (I hope). It's great for API's and business logic.

## Getting Started

```bash
npm install fun-ov
# Or
yarn add fun-ov
```

```ts
import { makeObjectChecker, makeListChecker, resultIsError } from "fun-ov";
// Or
import * as Fun from "fun-ov";

// You're ready to make or adapt your validators. Example:
import { is, or, resultIsError } from "fun-ov";

type Action = 'like' | 'comment' | 'subscribe';
const checkAction = or(is('like'), is('comment'), is('subscribe'));

// Get a value from somewhere else, like an HTTP request. This time, it's 'dislike'
const result = checkAction("dislike"); 
if (resultIsError(result)) {
    console.log("Don't @ me - YT. Fix one of these:", result);
}

// Technically, you could use a go-like pattern, but sometimes, false might mean an error.
const err = checkAction("dislike"); 
if (err) console.log("yell");
if (checkAction("sleep")) console.log("sleep is good, but not here :(");
```

## Usage

A validator (also called 'checker') is a function that returns any errors with the input value. No errors, no return value. 

This behavior is defined in `lib/rules.ts` via the `resultIsError` function.

Once you know there's an error, you can log it, display it to an end-user, or fix it, but that gets unwieldy pretty quick, especially if rules can change on the fly.

Composing these kinds of functions makes complex logic ([like the Stripe Connect API](https://stripe.com/docs/api/external_account_bank_accounts/create)) accessible and readable without much boilerplate.

Example:

```ts
// From test/company.ts
export const validateBankAccount = makeObjectChecker<BankAccount>({
  routing_number: isNonEmptyString, // Can replace these with any combined validation function
  account_number: isNonEmptyString, // See the Validation type in lib/rules.ts
  account_holder_name: isNonEmptyString,
  account_holder_type: is("company"),
});

export const validateCompany = makeObjectChecker<Company>({
  name: validateNames, // another object validator made using `makeObjectChecker`
  bank_account: optional(validateBankAccount),
  website: optional(checkIfString),
  tax_id: optional(checkIfString),
  email: optional(checkIfString),
  tos_accepted: and(checkIfBoolean, (accepted, company: Company) => {
    if (company.bank_account && !accepted)
      return "must accept TOS to maintain bank account";
  }),
});
// Validation errors will retain shape of object, so you know what properties were erroneous
```

This package provides building blocks to help you build your own validation. 

### Helpers

These functions return a Validator. You can run those validators with input, or you can combine them with other validators to make a bigger, overarching validator.

The format will be `function_name: Function input. What the returned validator will check, and how it will behave`.

Remember, Validators will only return if there is an error.

#### Identity & Equality

*See lib/equal.ts*

`is`: Takes one input. Validator checks if final input is equal (===) to that.

#### Logical Operators

*See lib/combinators.ts*

`and`: Takes any number of validators. Checks that final input is validated by all of them. Returns the erroneous result, if any.

`or`: Takes any number of validators. Checks that final input is validated by at least one of them. Returns list of errors (positions correspond to validators).

`EagerAnd` and `EagerOr`: Eager variants will run all validators passed to them, no matter what. Logically, they behave the same. Returns a list of errors (if logical result is false).

#### Type Checkers

*See lib/type-checkers.ts*

`checkIf<Type>`: Takes an input. Checks if it meets the type criteria. Covers all JS Types, definitive-ness, and existence.

`optional`: Takes a validator. Returns any error(s) from the validation, which only runs if the final input is not null, undefined, or NaN.

#### Collection Checkers

*See lib/object.ts and lib/list.ts*

These create convenient nest-able validators for objects, lists, and tuples. See in-code documentation for usage instructions.

`makeObjectChecker`: Returns object of errors. Properties correspond to bad properties on input object.

`makeListChecker`: Returns list of errors. Positions correspond to bad elements.

`makeTupleChecker`: Returns list of errors. Positions correspond to bad elements.

## Why does this exist?

Probably because I couldn't find the right packages at the right time. [Zod](https://github.com/colinhacks/zod) is great for schema definition, manipulation, and parsing, and [tRPC](https://github.com/trpc/trpc) is good for front-to-backend type-safe http API's. 

Zod is fun-ov's closest neighbor, but they differ in meaningful ways.

`fun-ov` isn't a tool or a framework. It's an idea and a pattern, with helpers to cut through annoying details and boilerplate.

It can replicate some of zod's functionality and do some things it can't (context-aware validation, more error cases/types), but it's smaller and less intrusive than zod. 

There isn't a tool to learn with `fun-ov`, just a pretty powerful idea made accessible. Fun-ov is a library of validation combinators that you can extend past validation use-cases.

 If the Wikipedia entry on combinators makes your eyes glaze over, this [SO question](https://stackoverflow.com/questions/7533837/explanation-of-combinators-for-the-working-man) is a good place to learn about them.

This package was created because validation is a recurring need, and existing solutions at the time of development
didn't meet my standards/needs for style, modularity, customizability, and extensibility.

## Future

Possible API changes:

- `makeMapChecker` - excluded because keys/values can be validated before insertion