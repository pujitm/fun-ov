import { Company, validateCompany } from "./company";
import { assertError, assertValid } from "./common";

describe("boring company test", () => {
  test("valid companies", () => {
    const coms: Company[] = [
      {
        name: {
          display: "pujitm",
        },
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {
          routing_number: "k",
          account_holder_name: "j",
          account_holder_type: "company",
          account_number: "234",
        },
        tos_accepted: true,
      },
    ];
    coms.map(validateCompany).forEach(assertValid);
  });
  test("invalid companies, but valid types", () => {
    const coms: Company[] = [
      {
        name: {
          display: "pujitm",
          legal: "",
        },
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {
          routing_number: "k",
          account_holder_name: "",
          account_holder_type: "company",
          account_number: "",
        },
        tos_accepted: true,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {
          routing_number: "k",
          account_holder_name: "j",
          account_holder_type: "company",
          account_number: "234",
        },
        tos_accepted: false,
      },
    ];
    coms.map(validateCompany).forEach(assertError);
  });
  test("invalid but plausible states", () => {
    const coms = [
      {
        name: {},
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {},
        tos_accepted: false,
      },
      {
        name: {
          display: "pujitm",
        },
        bank_account: {},
        tos_accepted: true,
      },
    ] as Company[];
    coms.map(validateCompany).forEach(assertError);
  });
});
