import {
  createValidator,
  isBoolean,
  isString,
  optional,
} from "../lib/ambiguous";

export interface Company {
  name: Names;
  bank_account?: BankAccount;
  website?: string;
  tax_id?: string;
  email?: string;
  tos_accepted: boolean;
}

export interface Names {
  legal?: string;
  display: string;
}

export const validateNames = createValidator<Names>({
  display: isString,
  legal: optional(isString),
});

export interface BankAccount {
  routing_number: string;
  account_number: string;
  account_holder_name: string;
  account_holder_type: "company";
}

export const validateBankAccount = createValidator<BankAccount>({
  routing_number: isString,
  account_number: isString,
  account_holder_name: isString,
  account_holder_type: (value) => value === "company",
});

export const validateCompany = createValidator<Company>({
  name: validateNames,
  bank_account: optional(validateBankAccount),
  website: optional(isString),
  tax_id: optional(isString),
  email: optional(isString),
  tos_accepted: isBoolean,
});
