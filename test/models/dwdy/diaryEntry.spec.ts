import { describe, it, expect, afterAll } from "vitest";
import "fake-indexeddb/auto";
import { faker } from "@faker-js/faker";
import { DiaryEntry, DiaryEntryIdentity } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/models/dwdy/feature";
import { InvalidParamsError } from "~/models/app/error";
import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import {
  genRandomDIndex,
  buildAttrs,
  build,
  create,
} from "../../factories/dwdy/diaryEntries";
import { create as createDiary } from "../../factories/dwdy/diaries";
import { dIndexToDt } from "~/models/dwdy/dateUtils";
import {
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsStoredBehavior,
  checkAssignBehavior,
} from "../../support/modelUtils";
import { genRandomIndex } from "../../support/randomUtils";

const TEST_CONTENT_FREATURES: DiaryFeature[] = [
  DiaryFeature.Text,
  DiaryFeature.Sticker,
];

function checkIndexValidationBehavior(runTextProc: (index: number) => void) {
  describe("when given index is invalid", () => {
    it("raise an invalid-params error with index:invalid reason", async () => {
      try {
        runTextProc(-1);
      } catch (err) {
        expect((err as InvalidParamsError).params).toEqual(["index"]);
        expect((err as InvalidParamsError).reason).toEqual("invalid");
      }
    });
  });
}

describe("DiaryEntry", () => {
  checkConstructorBehavior(
    (attrs) => {
      return new DiaryEntry({}, attrs);
    },
    { content: {} },
    buildAttrs,
    build
  );
  checkUidBehavior(
    (uid) => {
      return new DiaryEntry({ dUid: uid, dIndex: genRandomDIndex() });
    },
    (instance, uid) => {
      return `${uid}_${instance.doc.dIndex}`;
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
  describe(".fetch", () => {
    describe("when a model instance is found", () => {
      afterAll(() => {
        dbDwdy.diaryEntries.clear();
      });
      it("fetches the entry by given uid", async () => {
        const entry = await create();
        const [dUid, dIndex] = (entry.uid as string).split("_");
        const fetchedEntry = await DiaryEntry.fetch({ dUid, dIndex });
        expect(fetchedEntry.uid).toEqual(entry.uid);
        expect(fetchedEntry.isSaved).toBeTruthy();
      });
    });
    describe("when no entry is found", () => {
      it("returns a not-saved entry", async () => {
        const entryIdy = { dUid: genUid(), dIndex: genRandomDIndex() };
        const fetchedEntry = await DiaryEntry.fetch(entryIdy);
        expect(fetchedEntry.isSaved).toBeFalsy();
      });
    });
  });
  describe("#isSaved", () => {
    it("is assigned by constructor", () => {
      const isSaved = faker.datatype.boolean();
      const entry = new DiaryEntry({ isSaved });
      expect(entry.isSaved).toEqual(isSaved);
    });
    it("should not be stored in doc", () => {
      const isSaved = faker.datatype.boolean();
      const entry = new DiaryEntry({ isSaved });
      expect(entry.doc.isSaved).toBeUndefined();
    });
  });
  describe("#nextEntry, #prevEntry", () => {
    afterAll(() => {
      dbDwdy.diaryEntries.clear();
      dbDwdy.diaries.clear();
    });
    it("returns the prev/next diary entry ", async () => {
      const diary = await createDiary();
      await diary.appendNewEntry("A");
      await diary.appendNewEntry("B");
      await diary.appendNewEntry("C");
      const entryA = await diary.fetchEntry("A");
      const entryB = await diary.fetchEntry("B");
      const entryC = await diary.fetchEntry("C");

      // With empty prev entry
      expect((await entryA.prevEntry).doc.dUid).toEqual(diary.doc.dUid);
      expect((await entryA.prevEntry).doc.dIndex).toBeUndefined();
      expect((await entryA.prevEntry).isStored).toBeFalsy();

      // With existing next entry
      expect((await entryA.nextEntry).doc.dUid).toEqual(diary.doc.dUid);
      expect((await entryA.nextEntry).doc.dIndex).toEqual("B");
      expect((await entryA.nextEntry).isStored).toBeTruthy();

      // With existing prev entry
      expect((await entryB.prevEntry).doc.dUid).toEqual(diary.doc.dUid);
      expect((await entryB.prevEntry).doc.dIndex).toEqual("A");
      expect((await entryB.prevEntry).isStored).toBeTruthy();

      expect((await entryB.nextEntry).doc.dIndex).toEqual("C");
      expect((await entryC.prevEntry).doc.dIndex).toEqual("B");

      // With empty next entry
      expect((await entryC.nextEntry).doc.dUid).toEqual(diary.doc.dUid);
      expect((await entryC.nextEntry).doc.dIndex).toBeUndefined();
      expect((await entryC.nextEntry).isStored).toBeFalsy();
    });
  });
  describe("#save", () => {
    afterAll(() => {
      dbDwdy.diaryEntries.clear();
    });
    describe("when the instance has no dUid or dIndex", () => {
      it("throws an invalid-params error with ['dUid', 'dIndex']:required reason", async () => {
        const modelInst = build();
        try {
          await modelInst.save();
        } catch (err) {
          expect((err as InvalidParamsError).params).toEqual([
            "dUid",
            "dIndex",
          ]);
          expect((err as InvalidParamsError).reason).toEqual("required");
        }
      });
    });
    describe("when the instance is a new instance", () => {
      it("stores the doc with the 'create' action", async () => {
        const diary = await createDiary();
        const entryIdy: DiaryEntryIdentity = {
          dUid: diary.doc.dUid as string,
          dIndex: genRandomDIndex(),
        };
        const entry = new DiaryEntry(entryIdy);
        const result = await entry.save();
        expect(result.action).toEqual("create");
      });

      it("changes isSaved to true", async () => {
        const diary = await createDiary();
        const entryIdy: DiaryEntryIdentity = {
          dUid: diary.doc.dUid as string,
          dIndex: genRandomDIndex(),
        };
        const entry = new DiaryEntry(entryIdy);
        const result = await entry.save();
        expect(result.target.isSaved).toBeTruthy();
      });
    });
    describe("when the instance is an existing instance", () => {
      it("stores the doc with the 'update' action", async () => {
        const storedInst = await create();
        const result = await storedInst.save();
        expect(result.action).toEqual("update");
      });

      it("keeps uid not changed", async () => {
        const storedInst = await create();
        const oriUid = storedInst.uid;
        const result = await storedInst.save();
        expect(result.target.uid).toEqual(oriUid);
      });
    });
  });
  describe("#dIndexDate", () => {
    describe("when d-index is a date index", () => {
      it("returns the data coverted from d-index", () => {
        const dIndex = genRandomDIndex();
        const dEntry = new DiaryEntry({ dIndex });
        const result = dIndexToDt(dIndex);
        expect(dEntry.dIndexDate).toEqual(result);
      });
    });
    describe("when d-index is not a date index", () => {
      it("returns null", () => {
        const dIndex = faker.lorem.word();
        const dEntry = new DiaryEntry({ dIndex });
        expect(dEntry.dIndexDate).toBeNull();
      });
    });
  });
  describe("#fetchContents", () => {
    it("returns the contents with given feature", () => {
      const dEntryAttrs = buildAttrs();
      const dEntry = new DiaryEntry({}, dEntryAttrs);
      TEST_CONTENT_FREATURES.forEach((feature) => {
        const fetchedContents = dEntry.fetchContents(feature);
        const storedContents = dEntryAttrs.content[feature];
        expect(fetchedContents).toEqual(storedContents);
      });
    });
  });
  describe("#fetchContent", () => {
    it("returns the content with given feature and index", () => {
      const dEntryAttrs = buildAttrs();
      const dEntry = new DiaryEntry({}, dEntryAttrs);
      TEST_CONTENT_FREATURES.forEach((feature) => {
        const storedContents = dEntryAttrs.content[feature] || [];
        const index = genRandomIndex(storedContents.length);
        const fetchedContent = dEntry.fetchContent(feature, index);
        expect(fetchedContent).toEqual(storedContents[index]);
      });
    });
    TEST_CONTENT_FREATURES.forEach((feature) => {
      checkIndexValidationBehavior((index) => {
        const dEntry = build();
        dEntry.fetchContent(feature, index);
      });
    });
  });
  describe("#appendContent", () => {
    it("append the given value to contents with given feature", () => {
      const dEntry = build();
      TEST_CONTENT_FREATURES.forEach((feature) => {
        const value = faker.datatype.string();
        const contents = [...dEntry.fetchContents(feature)];
        dEntry.appendContent(feature, value);
        contents.push(value);
        expect(dEntry.fetchContents(feature)).toEqual(contents);
      });
    });
  });
  describe("#assignContent", () => {
    describe("when given index is less than the contents length", () => {
      it("assign the given value to contents with given feature and index", () => {
        const dEntry = build();
        TEST_CONTENT_FREATURES.forEach((feature) => {
          const value = faker.datatype.string();
          const contents = dEntry.fetchContents(feature);
          const index = genRandomIndex(contents.length);
          dEntry.assignContent(feature, index, value);
          expect(dEntry.fetchContent(feature, index)).toEqual(value);
        });
      });
    });
    describe("when given index is equal to the contents length", () => {
      it("append the given value to contents with given feature", () => {
        const dEntry = build();
        TEST_CONTENT_FREATURES.forEach((feature) => {
          const value = faker.datatype.string();
          const contents = [...dEntry.fetchContents(feature)];
          dEntry.assignContent(feature, contents.length, value);
          contents.push(value);
          expect(dEntry.fetchContents(feature)).toEqual(contents);
        });
      });
    });
    TEST_CONTENT_FREATURES.forEach((feature) => {
      checkIndexValidationBehavior((index) => {
        const dEntry = build();
        const value = faker.datatype.string();
        dEntry.assignContent(feature, index, value);
      });
    });
  });
  describe("#deleteContent", () => {
    it("delete the content with given feature and index", () => {
      const dEntry = build();
      TEST_CONTENT_FREATURES.forEach((feature) => {
        const contents = dEntry.fetchContents(feature);
        const index = genRandomIndex(contents.length);
        dEntry.deleteContent(feature, index);
        contents.splice(index, 1);
        expect(dEntry.fetchContents(feature)).toEqual(contents);
      });
    });
    TEST_CONTENT_FREATURES.forEach((feature) => {
      checkIndexValidationBehavior((index) => {
        const dEntry = build();
        dEntry.deleteContent(feature, index);
      });
    });
  });
  describe("#moveContent", () => {
    it("move the content with given feature and index", () => {
      const dEntry = build();
      TEST_CONTENT_FREATURES.forEach((feature) => {
        const contents = [...dEntry.fetchContents(feature)];
        const fromIndex = genRandomIndex(contents.length);
        const toIndex = genRandomIndex(contents.length);
        dEntry.moveContent(feature, fromIndex, toIndex);
        contents.splice(toIndex, 0, contents.splice(fromIndex, 1)[0]);
        expect(dEntry.fetchContents(feature)).toEqual(contents);
      });
    });
    TEST_CONTENT_FREATURES.forEach((feature) => {
      checkIndexValidationBehavior((index) => {
        const dEntry = build();
        dEntry.moveContent(feature, index, index);
      });
    });
  });
});
