import { describe, expect, it } from "vitest";

import {
  MoveDirection,
  MoveUnit,
  dIndexToDt,
  dIndexToDtStr,
  dtToDIndex,
  getNeighborDt,
  getNeighborDIndex,
  isSameDt,
} from "~/models/dwdy/dateUtils";

describe(".dIndexToDt", () => {
  it("returns the date by given dIndex", () => {
    const givenDIndex = "20220101";
    const expectedDt = new Date("2022-01-01").getTime();
    expect(dIndexToDt(givenDIndex).getTime()).toEqual(expectedDt);
  });
});
describe(".dIndexToDtStr", () => {
  it("returns the date string by given dIndex", () => {
    const givenDIndex = "20220101";
    const expectedDtStr = "2022.01.01";
    expect(dIndexToDtStr(givenDIndex)).toEqual(expectedDtStr);
  });
});
describe(".dtToDIndex", () => {
  it("returns the dIndex by given date", () => {
    const givenDt = new Date("2022-01-01");
    const expectedDIndex = "20220101";
    expect(dtToDIndex(givenDt)).toEqual(expectedDIndex);
  });
});
describe(".getNeighborDt", () => {
  it("return the neighbor date", () => {
    const testCases = [
      { params: ["prev", "month", 0], result: Date.parse("2022-02-01") },
      { params: ["next", "month", 0], result: Date.parse("2022-02-28") },
      { params: ["prev", "day", 0], result: Date.parse("2022-02-15") },
      { params: ["next", "day", 0], result: Date.parse("2022-02-15") },
      { params: ["prev", "month", 1], result: Date.parse("2022-01-01") },
      { params: ["next", "month", 1], result: Date.parse("2022-03-31") },
      { params: ["prev", "day", 1], result: Date.parse("2022-02-14") },
      { params: ["next", "day", 1], result: Date.parse("2022-02-16") },
      { params: ["prev", "month", 2], result: Date.parse("2021-12-01") },
      { params: ["next", "month", 2], result: Date.parse("2022-04-30") },
      { params: ["prev", "day", 2], result: Date.parse("2022-02-13") },
      { params: ["next", "day", 2], result: Date.parse("2022-02-17") },
    ];
    const baseDt = new Date(Date.parse("2022-02-15"));
    testCases.forEach((tc) => {
      const resultDt = getNeighborDt(
        baseDt,
        ...(tc.params as [MoveDirection, MoveUnit, number])
      );
      expect(resultDt.getTime()).toEqual(new Date(tc.result).getTime());
    });
  });
});
describe(".getNeighborDIndex", () => {
  it("return the neighbor date", () => {
    const testCases = [
      { params: ["prev", "month", 0], result: "20220201" },
      { params: ["next", "month", 0], result: "20220228" },
      { params: ["prev", "day", 0], result: "20220215" },
      { params: ["next", "day", 0], result: "20220215" },
      { params: ["prev", "month", 1], result: "20220101" },
      { params: ["next", "month", 1], result: "20220331" },
      { params: ["prev", "day", 1], result: "20220214" },
      { params: ["next", "day", 1], result: "20220216" },
      { params: ["prev", "month", 2], result: "20211201" },
      { params: ["next", "month", 2], result: "20220430" },
      { params: ["prev", "day", 2], result: "20220213" },
      { params: ["next", "day", 2], result: "20220217" },
    ];
    const baseDIndex = "20220215";
    testCases.forEach((tc) => {
      const resultDIndex = getNeighborDIndex(
        baseDIndex,
        ...(tc.params as [MoveDirection, MoveUnit, number])
      );
      expect(resultDIndex).toEqual(tc.result);
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
});
