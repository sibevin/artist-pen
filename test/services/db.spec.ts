import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { genUid, UID_RANDOM_SIZE } from "~/services/db";

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
