import { describe, expect, it, beforeEach } from "vitest";
import { ArrayPaginator } from "~/services/arrayPaginator";

describe("ArrayPaginator", () => {
  const testArray = [1, 2, 3, 4, 5, 6, 7, 8];
  const testPageSize = 2;
  let paginator: ArrayPaginator<number>;

  beforeEach(() => {
    paginator = new ArrayPaginator(testArray, testPageSize);
  });

  describe("constructor", () => {
    it("initializes the properties correctly", () => {
      expect(paginator.page).toBe(1);
      expect(paginator.totalPages).toBe(4);
    });
  });

  describe("#page=", () => {
    it("assigns the page value", () => {
      paginator.page = 2;
      expect(paginator.page).toBe(2);
    });
    describe("when given value is invalid", () => {
      it("keeps the page not changed", () => {
        paginator.page = 0;
        expect(paginator.page).toEqual(1);
      });
    });
  });

  describe("#currentEntries", () => {
    it("returns the entries of the current page", () => {
      expect(paginator.currentEntries()).toEqual([1, 2]);
      paginator.next();
      expect(paginator.currentEntries()).toEqual([3, 4]);
      paginator.prev();
      expect(paginator.currentEntries()).toEqual([1, 2]);
    });
  });

  describe("#next", () => {
    it("increments the page and return the entries of the next page", () => {
      expect(paginator.next()).toEqual([3, 4]);
      expect(paginator.page).toBe(2);
      expect(paginator.next()).toEqual([5, 6]);
      expect(paginator.page).toBe(3);
      expect(paginator.next()).toEqual([7, 8]);
      expect(paginator.page).toBe(4);
      expect(paginator.next()).toEqual([]);
      expect(paginator.page).toBe(4);
    });
  });

  describe("#prev", () => {
    it("decrements the page and return the entries of the previous page", () => {
      paginator.next();
      paginator.next();
      expect(paginator.prev()).toEqual([3, 4]);
      expect(paginator.page).toBe(2);
      expect(paginator.prev()).toEqual([1, 2]);
      expect(paginator.page).toBe(1);
      expect(paginator.prev()).toEqual([]);
      expect(paginator.page).toBe(1);
    });
  });
});
