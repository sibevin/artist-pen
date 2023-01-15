import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { addKey, deleteKey, listKeys } from "~/services/distribution";

describe("services/distribution", () => {
  describe(".addKey", () => {
    describe("when no map is given", () => {
      it("creates a map with given key and count 1", () => {
        const key = faker.lorem.word();
        const result = addKey(key);
        expect(result).toEqual({ [key]: 1 });
      });
    });
    describe("when the given key is not in the given map", () => {
      it("updates the given map with given key and count 1", () => {
        const map = { a: 1 };
        const key = faker.datatype.string();
        const result = addKey(key, map);
        expect(result).toEqual({ a: 1, [key]: 1 });
        expect(map).toEqual({ a: 1, [key]: 1 });
      });
    });
    describe("when the given key is in the given map", () => {
      it("increases the key count", () => {
        const key = faker.datatype.string();
        const count = faker.datatype.number();
        const map = { [key]: count };
        const result = addKey(key, map);
        expect(result).toEqual({ [key]: count + 1 });
        expect(map).toEqual({ [key]: count + 1 });
      });
    });
  });
  describe(".deleteKey", () => {
    describe("when no map is given", () => {
      it("creates a empty map", () => {
        const key = faker.lorem.word();
        const result = deleteKey(key);
        expect(result).toEqual({});
      });
    });
    describe("when the given key is not in the given map", () => {
      it("keeps the given map not changed", () => {
        const map = { a: 1 };
        const oriMap = structuredClone(map);
        const key = faker.datatype.string();
        const result = deleteKey(key, map);
        expect(result).toEqual(oriMap);
        expect(map).toEqual(oriMap);
      });
    });
    describe("when the given key is in the given map", () => {
      it("decreases the key count", () => {
        const key = faker.datatype.string();
        const count = faker.datatype.number();
        const map = { [key]: count };
        const result = deleteKey(key, map);
        expect(result).toEqual({ [key]: count - 1 });
        expect(map).toEqual({ [key]: count - 1 });
      });
    });
    describe("when the given key count is zero", () => {
      it("deletes the key from the map", () => {
        const key = faker.datatype.string();
        const map = { [key]: 1 };
        const result = deleteKey(key, map);
        expect(result).toEqual({});
        expect(map).toEqual({});
      });
    });
  });
  describe(".listKeys", () => {
    describe("when no map is given", () => {
      it("returns an empty arry", () => {
        const result = listKeys();
        expect(result).toEqual([]);
      });
    });
    describe("when a map is given", () => {
      it("returns the sorted keys", () => {
        const map = { b: 1, a: 2 };
        const result = listKeys(map);
        expect(result).toEqual(["a", "b"]);
      });
    });
  });
});
