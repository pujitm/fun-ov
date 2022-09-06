import { assertError, assertValid } from "../common";

describe("assumptions about JS Behavior", () => {
  test("empty values are truthy", () => {
    [{}, []].forEach((v) => expect(v).toBeTruthy());
  });
  test("ill defined values are falsy", () => {
    [null, undefined, NaN].forEach((v) => expect(v).toBeFalsy());
  });
});

describe("fundamental (default) validation rules", () => {
  describe("validation checks", () => {
    test("truthy results mean error", () => {
      [{}, []].forEach(assertError);
      [1, -1, Infinity, true].forEach(assertError);
    });

    test("falsy values mean error too", () => {
      ["", 0, false].forEach(assertError);
    });

    test("ill-, but not un-, defined values mean failure", () => {
      [null, NaN].forEach(assertError);
    });

    test("*only* undefined means success/valid", () => {
      const emptyFunction = function () {};
      [undefined, emptyFunction()].forEach(assertValid);
    });
  });
});
