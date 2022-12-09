import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { AppError, InvalidParamsError } from "~/models/app/error";

function overwriteByGivenCode(errorKlass: typeof AppError) {
  it("creates an app-error instance with given code", () => {
    const givenParams = { code: faker.lorem.word() };
    const error = new errorKlass(givenParams);
    expect(error.code).toEqual(givenParams.code);
  });
}

describe("AppError", () => {
  describe(".new", () => {
    it("creates an app-error instance with given params", () => {
      const givenParams = {
        code: faker.lorem.word(),
        message: faker.lorem.paragraph(),
        extra: { a: 1 },
      };
      const error = new AppError(givenParams);
      expect(error.code).toEqual(givenParams.code);
      expect(error.message).toEqual(givenParams.message);
      expect(error.extra).toEqual(givenParams.extra);
    });
    overwriteByGivenCode(AppError);
  });
});

describe("InvalidParamsError", () => {
  describe(".new", () => {
    it("creates an app-error instance with 'params' params", () => {
      const givenParams = { params: [faker.lorem.word()] };
      const error = new InvalidParamsError(givenParams);
      expect(error.params).toEqual(givenParams.params);
    });

    it("creates an app-error instance with 'reason' params", () => {
      const givenParams = {
        params: [faker.lorem.word()],
        reason: faker.lorem.word(),
      };
      const error = new InvalidParamsError(givenParams);
      expect(error.reason).toEqual(givenParams.reason);
    });

    it("creates an app-error with 'invalid_params' code", () => {
      const givenParams = { params: [faker.lorem.word()] };
      const error = new InvalidParamsError(givenParams);
      expect(error.code).toEqual("invalid_params");
    });
    overwriteByGivenCode(InvalidParamsError);
  });
});
