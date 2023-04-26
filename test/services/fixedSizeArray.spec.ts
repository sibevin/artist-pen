import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { pushEntry, unshiftEntry } from "~/services/fixedSizeArray";
import { genRandomIndex } from "test/support/randomUtils";

describe("services/fixedSizeArray", () => {
  describe(".pushEntry", () => {
    describe("when size is given", () => {
      it("retures the array with given size", () => {
        const size = genRandomIndex(10) + 1;
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = pushEntry(arr, entry, size);
        expect(result.length).toEqual(size);
      });
      it("pushes the entry to the array", () => {
        const size = genRandomIndex(10) + 1;
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = pushEntry(arr, entry, size);
        expect(result[result.length - 1]).toEqual(entry);
      });
      it("example", () => {
        const arr = [1, 2, 3, 4, 5];
        const entry = 6;
        const result = pushEntry(arr, entry, 3);
        expect(result).toEqual([4, 5, 6]);
      });
    });
    describe("when no size is given", () => {
      it("retures the array with the original size", () => {
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = pushEntry(arr, entry);
        expect(result.length).toEqual(arr.length);
      });
      it("pushes the entry to the array", () => {
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = pushEntry(arr, entry);
        expect(result[result.length - 1]).toEqual(entry);
      });
      it("example", () => {
        const arr = [1, 2, 3, 4, 5];
        const entry = 6;
        const result = pushEntry(arr, entry);
        expect(result).toEqual([2, 3, 4, 5, 6]);
      });
    });
  });
  describe(".unshiftEntry", () => {
    describe("when size is given", () => {
      it("retures the array with given size", () => {
        const size = genRandomIndex(10) + 1;
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = unshiftEntry(arr, entry, size);
        expect(result.length).toEqual(size);
      });
      it("unshifts the entry to the array", () => {
        const size = genRandomIndex(10) + 1;
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = unshiftEntry(arr, entry, size);
        expect(result[0]).toEqual(entry);
      });
      it("example", () => {
        const arr = [1, 2, 3, 4, 5];
        const entry = 6;
        const result = unshiftEntry(arr, entry, 3);
        expect(result).toEqual([6, 1, 2]);
      });
    });
    describe("when no size is given", () => {
      it("retures the array with the original size", () => {
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = unshiftEntry(arr, entry);
        expect(result.length).toEqual(arr.length);
      });
      it("unshifts the entry to the array", () => {
        const arr = faker.lorem.words(10).split(" ");
        const entry = faker.datatype.string();
        const result = unshiftEntry(arr, entry);
        expect(result[0]).toEqual(entry);
      });
      it("example", () => {
        const arr = [1, 2, 3, 4, 5];
        const entry = 6;
        const result = unshiftEntry(arr, entry);
        expect(result).toEqual([6, 1, 2, 3, 4]);
      });
    });
  });
});
