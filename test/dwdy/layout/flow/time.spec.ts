import { describe, it, expect, afterAll, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { dbDwdy } from "~/services/db/dwdy";
import { AppError } from "~/models/app/error";
import { create, build } from "=/factories/dwdy/diaries";
import { LAYOUT_FLOW } from "~/dwdy/layout/flow/time";
import { dtToEntryTs, getNeighborTs } from "~/dwdy/services/dateUtils";

describe("Flow::Time", () => {
  describe("#insertNewEntryByRouteQuery", () => {
    describe("when diary is not stored", () => {
      it("raises a 'diary_not_stored' error", async () => {
        const diary = build();
        try {
          await LAYOUT_FLOW.insertNewEntryByRouteQuery(diary, {});
        } catch (error) {
          expect((error as AppError).code).toEqual("diary_not_stored");
        }
      });
    });
    describe("when no timestamp query is given", () => {
      afterAll(() => {
        dbDwdy.diaries.clear();
      });
      it("raises a 'timestamp_required' error", async () => {
        const diary = await create();
        try {
          await LAYOUT_FLOW.insertNewEntryByRouteQuery(diary, {});
        } catch (error) {
          expect((error as AppError).code).toEqual("timestamp_required");
        }
      });
    });
    describe("when the timestamp entry exists", () => {
      afterAll(() => {
        dbDwdy.diaries.clear();
        dbDwdy.diaryEntries.clear();
      });
      it("returns the entry", async () => {
        const diary = await create();
        const timestamp = dtToEntryTs(new Date());
        const entry = await diary.appendEntry({ timestamp });
        const insertedEntry = await LAYOUT_FLOW.insertNewEntryByRouteQuery(
          diary,
          {
            ts: String(timestamp),
          }
        );
        expect(insertedEntry.doc.timestamp).toEqual(entry.doc.timestamp);
      });
    });
    describe("when no entry exists", () => {
      afterAll(() => {
        dbDwdy.diaries.clear();
        dbDwdy.diaryEntries.clear();
      });
      it("inserts a new entry with the given timestamp", async () => {
        const diary = await create();
        const timestamp = dtToEntryTs(new Date());
        const insertedEntry = await LAYOUT_FLOW.insertNewEntryByRouteQuery(
          diary,
          {
            ts: String(timestamp),
          }
        );
        expect(insertedEntry.doc.timestamp).toEqual(timestamp);
      });
    });
    describe("when some entries exist", () => {
      afterAll(() => {
        dbDwdy.diaries.clear();
        dbDwdy.diaryEntries.clear();
      });
      it("inserts a new entry according to the given timestamp", async () => {
        const diary = await create();
        const timestamp = dtToEntryTs(new Date());
        const tsBefore = getNeighborTs(timestamp, {
          direction: "prev",
          unit: "day",
        });
        const entryBefore = await diary.appendEntry({ timestamp: tsBefore });
        const tsAfter = getNeighborTs(timestamp, {
          direction: "next",
          unit: "day",
        });
        const entryAfter = await diary.appendEntry({ timestamp: tsAfter });
        const insertedEntry = await LAYOUT_FLOW.insertNewEntryByRouteQuery(
          diary,
          {
            ts: String(timestamp),
          }
        );
        expect(insertedEntry.doc.timestamp).toEqual(timestamp);
        expect(insertedEntry.doc.prevDIndex).toEqual(entryBefore.doc.dIndex);
        expect(insertedEntry.doc.nextDIndex).toEqual(entryAfter.doc.dIndex);
      });
    });
  });
});
