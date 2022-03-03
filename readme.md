<!--
 Copyright 2021 Pujit Mehrotra

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

# (Fun)ctional Object Validation for Typescript and Javascipt

The goal of this library is to provide a flexible and intuitive way to perform runtime validation
of objects and values in Javascript.

This package was created because validation is a recurring need, and existing solutions at the time of development
did not meet the author's standards for style, modularity, customizability, and extensibility.

## TODO

Possible future features (vote in issue):

- Support optional inversion of `resultIsError` and/or convenience lib (`checkIf<Type>`)
- Inline Validation (ie `checkObject(validators, val)`)
- Polymorphic Composition/Validation (`checkObject(validators)(val)` or `checkObject(validators, val)`)

Possible API changes:

- `checkMap` - excluded because keys/values can be validated before insertion

### Tests

For defaults provided: (object, list, type-checkers)

- different type than expected
- null/undefined values
- empty
- single
- normal
- valid
- invalid
- nested
