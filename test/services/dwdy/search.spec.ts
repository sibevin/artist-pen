import { describe, expect, it } from "vitest";
import { findKeywordMatch } from "~/services/dwdy/search";
import { SearchKeywordMode } from "~/types/dwdy/search";

describe("services/search", () => {
  describe(".findKeywordMatch", () => {
    describe("when 'substring' mode is given", () => {
      const TEST_CASES = [
        {
          given: {
            keyword: "D",
            target: "654321abcABC123456",
            option: {
              mode: "substring" as SearchKeywordMode,
              caseSensitive: false,
            },
          },
          result: {
            index: -1,
            match: "",
            highlight: "",
          },
        },
        {
          given: {
            keyword: "B",
            target: "654321abcABC123456",
            option: {
              mode: "substring" as SearchKeywordMode,
              caseSensitive: false,
            },
          },
          result: {
            index: 5,
            match: "B",
            highlight: "54321abcABC12",
          },
        },
        {
          given: {
            keyword: "B",
            target: "abcABC",
            option: {
              mode: "substring" as SearchKeywordMode,
              caseSensitive: false,
            },
          },
          result: {
            index: 1,
            match: "B",
            highlight: "abcABC",
          },
        },
        {
          given: {
            keyword: "B",
            target: "654321abcABC123456",
            option: {
              mode: "substring" as SearchKeywordMode,
              caseSensitive: true,
            },
          },
          result: {
            index: 5,
            match: "B",
            highlight: "21abcABC12345",
          },
        },
        {
          given: {
            keyword: "B",
            target: "abcABC",
            option: {
              mode: "substring" as SearchKeywordMode,
              caseSensitive: true,
            },
          },
          result: {
            index: 4,
            match: "B",
            highlight: "abcABC",
          },
        },
      ];
      it("finds keywords by using substring comparison", () => {
        TEST_CASES.forEach((tc) => {
          const result = findKeywordMatch(
            tc.given.keyword,
            tc.given.target,
            tc.given.option
          );
          expect(result.index).toEqual(tc.result.index);
          expect(result.match).toEqual(tc.result.match);
          expect(result.highlight).toEqual(tc.result.highlight);
        });
      });
      describe("when withHighlight:false is given", () => {
        it("returns an empty highlight", () => {
          TEST_CASES.forEach((tc) => {
            const result = findKeywordMatch(
              tc.given.keyword,
              tc.given.target,
              tc.given.option,
              false
            );
            expect(result.highlight).toEqual("");
          });
        });
      });
    });
    describe("when 'regex' mode is given", () => {
      const TEST_CASES = [
        {
          given: {
            keyword: "[D-Z]{1}",
            target: "654321abcABC123456",
            option: {
              mode: "regex" as SearchKeywordMode,
              caseSensitive: false,
            },
          },
          result: {
            index: -1,
            match: "",
            highlight: "",
          },
        },
        {
          given: {
            keyword: "[B-Z]{1}",
            target: "654321abcABC123456",
            option: {
              mode: "regex" as SearchKeywordMode,
              caseSensitive: false,
            },
          },
          result: {
            index: 5,
            match: "b",
            highlight: "54321abcABC12",
          },
        },
        {
          given: {
            keyword: "[B-Z]{1}",
            target: "abcABC",
            option: {
              mode: "regex" as SearchKeywordMode,
              caseSensitive: false,
            },
          },
          result: {
            index: 1,
            match: "b",
            highlight: "abcABC",
          },
        },
        {
          given: {
            keyword: "[B-Z]{1}",
            target: "654321abcABC123456",
            option: {
              mode: "regex" as SearchKeywordMode,
              caseSensitive: true,
            },
          },
          result: {
            index: 5,
            match: "B",
            highlight: "21abcABC12345",
          },
        },
        {
          given: {
            keyword: "[B-Z]{1}",
            target: "abcABC",
            option: {
              mode: "regex" as SearchKeywordMode,
              caseSensitive: true,
            },
          },
          result: {
            index: 4,
            match: "B",
            highlight: "abcABC",
          },
        },
      ];
      it("finds keywords by using regex comparison", () => {
        TEST_CASES.forEach((tc) => {
          const result = findKeywordMatch(
            tc.given.keyword,
            tc.given.target,
            tc.given.option
          );
          expect(result.index).toEqual(tc.result.index);
          expect(result.match).toEqual(tc.result.match);
          expect(result.highlight).toEqual(tc.result.highlight);
        });
      });
      describe("when withHighlight:false is given", () => {
        it("returns an empty highlight", () => {
          TEST_CASES.forEach((tc) => {
            const result = findKeywordMatch(
              tc.given.keyword,
              tc.given.target,
              tc.given.option,
              false
            );
            expect(result.highlight).toEqual("");
          });
        });
      });
    });
  });
});
