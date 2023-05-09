import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { nextEntry, prevEntry } from "~/services/arrayLooper";
import { genRandomIndex } from "test/support/randomUtils";

describe("services/arrayLooper", () => {
  describe(".nextEntry", () => {
    describe("when no entry is given", () => {
      it("retures the first entry", () => {
        const arr = faker.lorem.words().split(" ");
        const result = nextEntry(arr);
        expect(result).toEqual(arr[0]);
      });
    });
    describe("when the given entry is not found", () => {
      it("retures the first entry", () => {
        const arr = faker.lorem.words().split(" ");
        const entry = faker.datatype.string();
        const result = nextEntry(arr, entry);
        expect(result).toEqual(arr[0]);
      });
    });
    describe("when the entry is the last one", () => {
      it("retures the first entry", () => {
        const arr = faker.lorem.words().split(" ");
        const entry = arr[arr.length - 1];
        const result = nextEntry(arr, entry);
        expect(result).toEqual(arr[0]);
      });
    });
    describe("when the entry is not the last one", () => {
      it("retures the next entry", () => {
        const arr = faker.lorem.words().split(" ");
        const index = genRandomIndex(arr.length - 1);
        const entry = arr[index];
        const result = nextEntry(arr, entry);
        expect(result).toEqual(arr[index + 1]);
      });
    });
  });
  describe(".prevEntry", () => {
    describe("when no entry is given", () => {
      it("retures the last entry", () => {
        const arr = faker.lorem.words().split(" ");
        const result = prevEntry(arr);
        expect(result).toEqual(arr[arr.length - 1]);
      });
    });
    describe("when the given entry is not found", () => {
      it("retures the last entry", () => {
        const arr = faker.lorem.words().split(" ");
        const entry = faker.datatype.string();
        const result = prevEntry(arr, entry);
        expect(result).toEqual(arr[arr.length - 1]);
      });
    });
    describe("when the entry is the first one", () => {
      it("retures the last entry", () => {
        const arr = faker.lorem.words().split(" ");
        const entry = arr[0];
        const result = prevEntry(arr, entry);
        expect(result).toEqual(arr[arr.length - 1]);
      });
    });
    describe("when the entry is not the first one", () => {
      it("retures the previous entry", () => {
        const arr = faker.lorem.words().split(" ");
        const index = genRandomIndex(arr.length - 1) + 1;
        const entry = arr[index];
        const result = prevEntry(arr, entry);
        expect(result).toEqual(arr[index - 1]);
      });
    });
  });
});
