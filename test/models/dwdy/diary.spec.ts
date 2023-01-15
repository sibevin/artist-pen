import { describe, it, expect, afterAll, afterEach } from "vitest";
import { faker } from "@faker-js/faker";
import "fake-indexeddb/auto";
import { Diary, DIndex } from "~/models/dwdy/diary";
import { AppError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import {
  buildAttrs,
  build,
  create,
  buildDefaultDocAttrs,
} from "../../factories/dwdy/diaries";
import {
  checkFetchBehavior,
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsStoredBehavior,
  checkAssignBehavior,
  checkSaveBehavior,
} from "../../support/modelUtils";
import { randomPick } from "test/support/randomUtils";
import { DiaryLayout, TIME_BASED_LAYOUTS } from "~/models/dwdy/layout";

function checkEntryExisting(
  runProc: (diary: Diary, dIndex: DIndex) => Promise<void>
) {
  afterEach(() => {
    dbDwdy.diaries.clear();
  });
  describe("check", () => {
    describe("when the given entry exists", () => {
      it("raises an app-error with 'entry_is_existing' code", async () => {
        try {
          const diary = await create();
          const dIndex = faker.lorem.word();
          await diary.appendNewEntry(dIndex);
          await runProc(diary, dIndex);
        } catch (error) {
          expect((error as AppError).code).toEqual("existing_diary_entry");
        }
      });
    });
  });
}

describe("Diary", () => {
  checkFetchBehavior(
    (inst) => {
      return Diary.fetch(inst.uid as string);
    },
    () => {
      dbDwdy.diaries.clear();
    },
    () => {
      return new Diary({ dUid: genUid() });
    },
    create
  );
  checkConstructorBehavior(
    (attrs) => {
      return new Diary(attrs);
    },
    buildDefaultDocAttrs(),
    buildAttrs,
    build
  );
  checkUidBehavior(
    (uid) => {
      return new Diary({ dUid: uid });
    },
    (_instance, uid) => {
      return uid;
    }
  );
  checkIsStoredBehavior(
    () => {
      dbDwdy.diaries.clear();
    },
    build,
    create
  );
  checkAssignBehavior(buildAttrs, build);
  checkSaveBehavior(
    () => {
      dbDwdy.diaries.clear();
    },
    build,
    create
  );
  describe("#isTimeBasedLayout", () => {
    describe("when diary layout is a time-based layout", () => {
      it("returns true", () => {
        const diary = build({ layout: randomPick(TIME_BASED_LAYOUTS) });
        expect(diary.isTimeBasedLayout).toBeTruthy();
      });
    });
    describe("when diary layout is the 'Notebook' layout", () => {
      it("returns false", () => {
        const diary = build({ layout: DiaryLayout.Notebook });
        expect(diary.isTimeBasedLayout).toBeFalsy();
      });
    });
  });
  describe("#fetchEntry", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    it("fetches the diary entry by given d-index", async () => {
      const diary = await create();
      await diary.appendNewEntry("20220115");
      const entry = await diary.fetchEntry("20220115");
      expect(entry.doc.dIndex).toEqual("20220115");
    });
  });
  describe("#fetchMonthEntries", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    it("fetches month entries according to the given date", async () => {
      const diary = await create();
      await diary.appendNewEntry("20220115");
      await diary.appendNewEntry("20220101");
      await diary.appendNewEntry("20220131");
      const givenDt = new Date("2022-01-07");
      const result = await diary.fetchMonthEntries(givenDt);
      expect(result.dIndexes).toEqual(["20220101", "20220115", "20220131"]);
      expect(result.entryMap["20220101"].doc.dIndex).toEqual("20220101");
      expect(result.entryMap["20220115"].doc.dIndex).toEqual("20220115");
      expect(result.entryMap["20220131"].doc.dIndex).toEqual("20220131");
      expect(result.entryMap["20220120"]).toBeUndefined();
    });
  });
  describe("#insertNewEntryWithDIndexOrder", () => {
    afterEach(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    describe("when no entry in the diary", () => {
      it("appends the entry with undefined prevDIndex and nextDIndex", async () => {
        const diary = await create();
        const dIndex = faker.lorem.word();
        await diary.insertNewEntryWithDIndexOrder(dIndex);
        const insertedEntry = await diary.lastEntry;
        expect(insertedEntry.doc.dIndex).toEqual(dIndex);
        expect(insertedEntry.doc.prevDIndex).toBeUndefined();
        expect(insertedEntry.doc.nextDIndex).toBeUndefined();
      });
    });
    describe("when the diary has some entries", () => {
      it("inserts the entry to the position by given d-index", async () => {
        const diary = await create();
        await diary.appendNewEntry("20220110");
        await diary.appendNewEntry("20220115");
        const testCase = [
          { dIndex: "20220113", prev: "20220110", next: "20220115" },
          { dIndex: "20220101", prev: undefined, next: "20220110" },
          { dIndex: "20220117", prev: "20220115", next: undefined },
        ];
        testCase.forEach(async (tc) => {
          const insertedEntry = await diary.insertNewEntryWithDIndexOrder(
            tc.dIndex
          );
          expect(insertedEntry.doc.dIndex).toEqual(tc.dIndex);
          expect(insertedEntry.doc.prevDIndex).toEqual(tc.prev);
          expect(insertedEntry.doc.nextDIndex).toEqual(tc.next);
        });
      });
    });
    checkEntryExisting(async (diary, dIndex) => {
      await diary.insertNewEntryWithDIndexOrder(dIndex);
    });
  });
  describe("#appendNewEntry", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    describe("when no entry in the diary", () => {
      it("appends the entry with undefined prevDIndex and nextDIndex", async () => {
        const diary = await create();
        const dIndex = faker.lorem.word();
        await diary.appendNewEntry(dIndex);
        const insertedEntry = await diary.lastEntry;
        expect(insertedEntry.doc.dIndex).toEqual(dIndex);
        expect(insertedEntry.doc.prevDIndex).toBeUndefined();
        expect(insertedEntry.doc.nextDIndex).toBeUndefined();
      });
    });
    describe("when the diary has some entries", () => {
      it("append the entry to the last entry", async () => {
        const diary = await create();
        const existingDIndex = faker.lorem.word();
        await diary.appendNewEntry(existingDIndex);
        const dIndex = faker.lorem.word();
        await diary.appendNewEntry(dIndex);
        const insertedEntry = await diary.lastEntry;
        expect(insertedEntry.doc.dIndex).toEqual(dIndex);
        expect(insertedEntry.doc.prevDIndex).toEqual(existingDIndex);
        expect(insertedEntry.doc.nextDIndex).toBeUndefined();
      });
    });
    checkEntryExisting(async (diary, dIndex) => {
      await diary.appendNewEntry(dIndex);
    });
  });
  describe("#moveEntry", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    describe("when target d-index is given", () => {
      it("moves the entry to the position before the target entry.", async () => {
        const diary = await create();
        await diary.appendNewEntry("A");
        await diary.appendNewEntry("B");
        await diary.appendNewEntry("C");
        await diary.appendNewEntry("D");
        await diary.appendNewEntry("E");
        await diary.moveEntry("B", "D");
        await diary.moveEntry("C", "A");
        const entryIndexes = (await diary.traverseEntries()).map(
          (entry) => entry.doc.dIndex
        );
        const entryDescIndexes = (await diary.traverseEntries("desc")).map(
          (entry) => entry.doc.dIndex
        );
        expect(entryIndexes).toEqual(["C", "A", "B", "D", "E"]);
        expect(entryDescIndexes).toEqual(["E", "D", "B", "A", "C"]);
      });
    });
    describe("when no target d-index is given", () => {
      it("moves the entry to the last entry.", async () => {
        const diary = await create();
        await diary.appendNewEntry("A");
        await diary.appendNewEntry("B");
        await diary.appendNewEntry("C");
        await diary.moveEntry("B");
        const entryIndexes = (await diary.traverseEntries()).map(
          (entry) => entry.doc.dIndex
        );
        const entryDescIndexes = (await diary.traverseEntries("desc")).map(
          (entry) => entry.doc.dIndex
        );
        expect(entryIndexes).toEqual(["A", "C", "B"]);
        expect(entryDescIndexes).toEqual(["B", "C", "A"]);
      });
    });
  });
  describe("#traverseEntries", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    it("raverse diary entries with the given order", async () => {
      const diary = await create();
      await diary.appendNewEntry("A");
      await diary.appendNewEntry("B");
      await diary.appendNewEntry("C");
      const entryIndexes = (await diary.traverseEntries()).map(
        (entry) => entry.doc.dIndex
      );
      const entryDescIndexes = (await diary.traverseEntries("desc")).map(
        (entry) => entry.doc.dIndex
      );
      expect(entryIndexes).toEqual(["A", "B", "C"]);
      expect(entryDescIndexes).toEqual(["C", "B", "A"]);
    });
  });
});
