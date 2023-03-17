import { describe, expect, it } from "vitest";
import { getDurationHms, getDurationString } from "~/services/duration";

const TEST_CASES = [
  {
    duration: 0,
    hms: { hours: 0, minutes: 0, seconds: 0 },
    str: "00:00:00",
  },
  {
    duration: 60,
    hms: { hours: 0, minutes: 1, seconds: 0 },
    str: "00:01:00",
  },
  {
    duration: 3600,
    hms: { hours: 1, minutes: 0, seconds: 0 },
    str: "01:00:00",
  },
  {
    duration: 12345,
    hms: { hours: 3, minutes: 25, seconds: 45 },
    str: "03:25:45",
  },
  {
    duration: 12345.6789,
    hms: { hours: 3, minutes: 25, seconds: 45 },
    str: "03:25:45",
  },
];

describe("services/duration", () => {
  describe(".getDurationHms", () => {
    it("retures the duration with H:M:S format", () => {
      TEST_CASES.forEach((tc) => {
        const hms = getDurationHms(tc.duration);
        expect(tc.hms).toEqual(hms);
      });
    });
  });
  describe(".getDurationString", () => {
    it("retures the duration with H:M:S format", () => {
      TEST_CASES.forEach((tc) => {
        const str = getDurationString(tc.duration);
        expect(tc.str).toEqual(str);
      });
    });
  });
});
