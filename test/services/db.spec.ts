import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { genUid, normalizeObject, UID_RANDOM_SIZE } from "~/services/db";

describe(".genUid", () => {
  beforeAll(() => {
    const nowDate = new Date();
    vi.useFakeTimers();
    vi.setSystemTime(nowDate);
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("generates random uid with the default length", () => {
    const ts = new Date().toISOString().replace(/[^\d]/g, "");
    const uidRegex = new RegExp(`^${ts}[a-zA-Z0-9]{${UID_RANDOM_SIZE}}$`);
    expect(genUid()).toMatch(uidRegex);
  });
});

describe(".normalizeObject", () => {
  it("normalizes the given object", () => {
    const target = { a: new Blob(), b: { c: new Blob() } };
    const result = { a: {}, b: { c: {} } };
    expect(normalizeObject(target)).toEqual(result);
  });
  describe("when 'except' option is given", () => {
    it("returns the normalized object without the except fields", () => {
      const target = { a: new Blob(), b: { c: new Blob() } };
      const result = { a: {}, b: target["b"] };
      expect(normalizeObject(target, { except: ["b"] })).toEqual(result);
    });
  });
});
