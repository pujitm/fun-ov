import { and, EagerAnd, EagerOr, or } from "../../lib/combinators";
import { assertError, assertValid } from "../common";

describe("logical operators", () => {
  const makeMockCheckers = () => ({
    valid: jest.fn(() => undefined),
    error: jest.fn(() => "error"),
  });
  const input = "anything";
  function testAnd(and) {
    return () => {
      const checkers = makeMockCheckers();
      assertValid(and(checkers.valid, checkers.valid)(input));
      assertError(and(checkers.valid, checkers.error)(input));
      assertError(and(checkers.error, checkers.valid)(input));
      assertError(and(checkers.error, checkers.error)(input));
    };
  }
  function testOr(or) {
    return () => {
      const checkers = makeMockCheckers();
      assertError(or(checkers.error, checkers.error)(input));
      assertValid(or(checkers.valid, checkers.error)(input));
      assertValid(or(checkers.error, checkers.valid)(input));
      assertValid(or(checkers.valid, checkers.valid)(input));
    };
  }
  test("and validator (logical conjuction)", testAnd(and));

  test("or validator (logical disjunction)", testOr(or));
  test("EagerAnd works", testAnd(EagerAnd));
  test("EagerOr works", testOr(EagerOr));
  test("EagerAnd is Eager", () => {
    let checkers = makeMockCheckers();
    const refreshCheckers = () => (checkers = makeMockCheckers());

    EagerAnd(checkers.error, checkers.valid)(input);
    expect(checkers.valid).toBeCalledTimes(1);
    refreshCheckers();

    EagerAnd(checkers.error, checkers.error)(input);
    expect(checkers.error).toBeCalledTimes(2);
  });
  test("EagerOr is Eager", () => {
    let checkers = makeMockCheckers();
    const refreshCheckers = () => (checkers = makeMockCheckers());

    EagerOr(checkers.valid, checkers.valid)(input);
    expect(checkers.valid).toBeCalledTimes(2);
    refreshCheckers();

    EagerOr(checkers.valid, checkers.error)(input);
    expect(checkers.error).toBeCalledTimes(1);
  });
});
