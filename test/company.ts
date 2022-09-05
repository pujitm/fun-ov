import { and } from "../lib/combinators";
import { is } from "../lib/equal";
import { createObjectValidator } from "../lib/object";
import { checkIfBoolean, checkIfString, optional } from "../lib/simple";

export interface Names {
  legal?: string;
  display: string;
}

const isNonEmptyString = and(checkIfString, (str: string) => {
  if (str.length === 0) return "cannot be empty";
});

export const validateNames = createObjectValidator<Names>({
  display: isNonEmptyString,
  legal: optional(isNonEmptyString),
});

export interface BankAccount {
  routing_number: string;
  account_number: string;
  account_holder_name: string;
  account_holder_type: "company";
}

export const validateBankAccount = createObjectValidator<BankAccount>({
  routing_number: isNonEmptyString,
  account_number: isNonEmptyString,
  account_holder_name: isNonEmptyString,
  account_holder_type: is("company"),
});

export interface Company {
  name: Names;
  bank_account?: BankAccount;
  website?: string;
  tax_id?: string;
  email?: string;
  tos_accepted: boolean;
}

export const validateCompany = createObjectValidator<Company>({
  name: validateNames,
  bank_account: optional(validateBankAccount),
  website: optional(checkIfString),
  tax_id: optional(checkIfString),
  email: optional(checkIfString),
  tos_accepted: and(checkIfBoolean, (accepted, company: Company) => {
    if (company.bank_account && !accepted)
      return "must accept TOS to maintain bank account";
  }),
});
