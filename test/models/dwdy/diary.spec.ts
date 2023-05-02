import { describe, it, expect, afterAll, afterEach } from "vitest";
import { faker } from "@faker-js/faker";
import "fake-indexeddb/auto";
import { DIndex } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
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
          await diary.appendEntry({}, dIndex);
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
  describe("#fetchEntry", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    it("fetches the diary entry by given d-index", async () => {
      const diary = await create();
      const dIndex = genUid();
      await diary.appendEntry({}, dIndex);
      const entry = await diary.fetchEntry({ dIndex });
      expect(entry && entry.doc.dIndex).toEqual(dIndex);
    });
  });
  describe("#appendEntry", () => {
    afterAll(() => {
      dbDwdy.diaries.clear();
      dbDwdy.diaryEntries.clear();
    });
    describe("when no entry in the diary", () => {
      it("appends the entry with undefined prevDIndex and nextDIndex", async () => {
        const diary = await create();
        const dIndex = genUid();
        await diary.appendEntry({}, dIndex);
        const insertedEntry = await diary.lastEntry;
        expect(insertedEntry && insertedEntry.doc.dIndex).toEqual(dIndex);
        expect(insertedEntry && insertedEntry.doc.prevDIndex).toBeUndefined();
        expect(insertedEntry && insertedEntry.doc.nextDIndex).toBeUndefined();
      });
    });
    describe("when the diary has some entries", () => {
      it("append the entry to the last entry", async () => {
        const diary = await create();
        const existingDIndex = genUid();
        await diary.appendEntry({}, existingDIndex);
        const dIndex = genUid();
        await diary.appendEntry({}, dIndex);
        const insertedEntry = await diary.lastEntry;
        expect(insertedEntry && insertedEntry.doc.dIndex).toEqual(dIndex);
        expect(insertedEntry && insertedEntry.doc.prevDIndex).toEqual(
          existingDIndex
        );
        expect(insertedEntry && insertedEntry.doc.nextDIndex).toBeUndefined();
      });
    });
    checkEntryExisting(async (diary, dIndex) => {
      await diary.appendEntry({}, dIndex);
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
        await diary.appendEntry({}, "A");
        await diary.appendEntry({}, "B");
        await diary.appendEntry({}, "C");
        await diary.appendEntry({}, "D");
        await diary.appendEntry({}, "E");
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
        await diary.appendEntry({}, "A");
        await diary.appendEntry({}, "B");
        await diary.appendEntry({}, "C");
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
      await diary.appendEntry({}, "A");
      await diary.appendEntry({}, "B");
      await diary.appendEntry({}, "C");
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
