import { describe, expect, it } from "vitest";
import {
  getNeighborDt,
  isSameDt,
  getBeginningOfDayTs,
  dtToEntryTs,
  entryTsToDt,
  GetNeighborOption,
} from "~/dwdy/services/dateUtils";

describe.only(".getNeighborDt", () => {
  it("return the neighbor date", () => {
    const testCases = [
      {
        opts: {
          direction: "current",
        },
        result: "2022-02-15 12:34:56",
      },
      {
        opts: {
          direction: "current",
          alignment: "begin",
        },
        result: "2022-02-15 00:00:00",
      },
      {
        opts: {
          direction: "current",
          alignment: "end",
        },
        result: "2022-02-15 23:59:59.999",
      },
      {
        opts: {
          direction: "current",
          unit: "month",
          alignment: "begin",
        },
        result: "2022-02-01 00:00:00",
      },
      {
        opts: {
          direction: "current",
          unit: "month",
          alignment: "end",
        },
        result: "2022-02-28 23:59:59.999",
      },
      {
        opts: {
          direction: "next",
        },
        result: "2022-02-16 12:34:56",
      },
      {
        opts: {
          direction: "next",
          unit: "month",
        },
        result: "2022-03-15 12:34:56",
      },
      {
        opts: {
          direction: "next",
          step: 2,
        },
        result: "2022-02-17 12:34:56",
      },
      {
        opts: {
          direction: "next",
          unit: "month",
          step: 2,
        },
        result: "2022-04-15 12:34:56",
      },
      {
        opts: {
          direction: "next",
          step: 2,
          alignment: "begin",
        },
        result: "2022-02-17 00:00:00",
      },
      {
        opts: {
          direction: "next",
          step: 2,
          alignment: "end",
        },
        result: "2022-02-17 23:59:59.999",
      },
      {
        opts: {
          direction: "next",
          unit: "month",
          step: 2,
          alignment: "begin",
        },
        result: "2022-04-01 00:00:00",
      },
      {
        opts: {
          direction: "next",
          unit: "month",
          step: 2,
          alignment: "end",
        },
        result: "2022-04-30 23:59:59.999",
      },
      {
        opts: {
          direction: "prev",
        },
        result: "2022-02-14 12:34:56",
      },
      {
        opts: {
          direction: "prev",
          unit: "month",
        },
        result: "2022-01-15 12:34:56",
      },
      {
        opts: {
          direction: "prev",
          step: 2,
        },
        result: "2022-02-13 12:34:56",
      },
      {
        opts: {
          direction: "prev",
          unit: "month",
          step: 2,
        },
        result: "2021-12-15 12:34:56",
      },
      {
        opts: {
          direction: "prev",
          step: 2,
          alignment: "begin",
        },
        result: "2022-02-13 00:00:00",
      },
      {
        opts: {
          direction: "prev",
          step: 2,
          alignment: "end",
        },
        result: "2022-02-13 23:59:59.999",
      },
      {
        opts: {
          direction: "prev",
          unit: "month",
          step: 2,
          alignment: "begin",
        },
        result: "2021-12-01 00:00:00",
      },
      {
        opts: {
          direction: "prev",
          unit: "month",
          step: 2,
          alignment: "end",
        },
        result: "2021-12-31 23:59:59.999",
      },
    ];
    const baseDt = new Date("2022-02-15 12:34:56");
    testCases.forEach((tc) => {
      const resultDt = getNeighborDt(baseDt, tc["opts"] as GetNeighborOption);
      const expectedDt = new Date(tc.result);
      expect(resultDt.getTime()).toEqual(expectedDt.getTime());
    });
  });
  describe("when the neighbor datetime is out of range", () => {
    it("arranges to the end of the given unit", () => {
      const baseDt = new Date("2022-01-31 12:34:56");
      const resultDt = getNeighborDt(baseDt, {
        direction: "next",
        unit: "month",
      });
      const expectedDt = new Date("2022-02-28 12:34:56");
      expect(resultDt.getTime()).toEqual(expectedDt.getTime());
    });
  });
});
describe(".isSameDt", () => {
  describe("when given dates are the same", () => {
    it("return true", () => {
      const dt1 = new Date(2022, 1, 1);
      const dt2 = new Date(2022, 1, 1);
      expect(isSameDt(dt1, dt2)).toBeTruthy();
    });
  });
  describe("when given dates are not same", () => {
    it("return true", () => {
      const dt1 = new Date(2022, 1, 1);
      const dt2 = new Date(2022, 1, 11);
      expect(isSameDt(dt1, dt2)).toBeFalsy();
      const dt3 = new Date(2022, 2, 1);
      expect(isSameDt(dt1, dt3)).toBeFalsy();
      const dt4 = new Date(2023, 1, 1);
      expect(isSameDt(dt1, dt4)).toBeFalsy();
    });
  });
  describe("when given range is 'month'", () => {
    describe("when given dates are in the same month", () => {
      it("return true", () => {
        const dt1 = new Date(2022, 1, 1);
        const dt2 = new Date(2022, 1, 15);
        expect(isSameDt(dt1, dt2, "month")).toBeTruthy();
      });
    });
    describe("when given dates are not in the same month", () => {
      it("return true", () => {
        const dt1 = new Date(2022, 1, 1);
        const dt2 = new Date(2022, 2, 1);
        expect(isSameDt(dt1, dt2, "month")).toBeFalsy();
        const dt3 = new Date(2023, 1, 1);
        expect(isSameDt(dt1, dt3, "month")).toBeFalsy();
      });
    });
  });
  describe("when given range is 'year'", () => {
    describe("when given dates are in the same year", () => {
      it("return true", () => {
        const dt1 = new Date(2022, 1, 1);
        const dt2 = new Date(2022, 2, 15);
        expect(isSameDt(dt1, dt2, "year")).toBeTruthy();
      });
    });
    describe("when given dates are not in the same year", () => {
      it("return true", () => {
        const dt1 = new Date(2022, 1, 1);
        const dt2 = new Date(2023, 1, 1);
        expect(isSameDt(dt1, dt2, "year")).toBeFalsy();
      });
    });
  });
  describe(".getBeginningOfDayTs", () => {
    it("reranges the given timestamp to the beginning of the day", () => {
      const ts = Date.now();
      const result = getBeginningOfDayTs(ts);
      const expectedDt = new Date(ts);
      expectedDt.setUTCHours(0, 0, 0, 0);
      expect(result).toEqual(expectedDt.getTime());
    });
  });
  describe(".dtToEntryTs", () => {
    it("returns the timestamp for entry by given datetime", () => {
      const dt = new Date();
      const ts = dtToEntryTs(dt);
      const tsDt = new Date();
      tsDt.setUTCFullYear(dt.getFullYear());
      tsDt.setUTCMonth(dt.getMonth());
      tsDt.setUTCDate(dt.getDate());
      const expectedTs = getBeginningOfDayTs(tsDt.getTime());
      expect(ts).toEqual(expectedTs);
    });
  });
  describe(".entryTsToDt", () => {
    it("returns the date from the entry timestamp", () => {
      const ts = getBeginningOfDayTs(Date.now());
      const dt = entryTsToDt(ts);
      const tsDt = new Date(ts);
      const expectedDt = new Date();
      expectedDt.setFullYear(tsDt.getUTCFullYear());
      expectedDt.setMonth(tsDt.getUTCMonth());
      expectedDt.setDate(tsDt.getUTCDate());
      expectedDt.setHours(0, 0, 0, 0);
      expect(dt).toEqual(expectedDt);
    });
  });
});
