import { describe, it, expect, afterAll } from "vitest";
import "fake-indexeddb/auto";
import { faker } from "@faker-js/faker";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/dwdy/feature/def";
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
import { entryTsToDt } from "~/dwdy/services/dateUtils";
import {
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsStoredBehavior,
  checkAssignBehavior,
} from "../../support/modelUtils";
import { genRandomIndex, randomSample } from "../../support/randomUtils";

const TEST_CONTENT_FREATURES: DiaryFeature[] = [
  DiaryFeature.Text,
  DiaryFeature.Sticker,
  DiaryFeature.Tag,
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
        expect(fetchedEntry).not.toBeNull();
        if (fetchedEntry) {
          expect(fetchedEntry.uid).toEqual(entry.uid);
          expect(fetchedEntry.doc.dUid).toEqual(entry.doc.dUid);
          expect(fetchedEntry.isStored).toBeTruthy();
        }
      });
    });
    describe("when no entry is found", () => {
      it("returns null", async () => {
        const entryIdy = { dUid: genUid(), dIndex: genRandomDIndex() };
        const fetchedEntry = await DiaryEntry.fetch(entryIdy);
        expect(fetchedEntry).toBeNull();
      });
    });
  });
  describe("#nextEntry, #prevEntry", () => {
    afterAll(() => {
      dbDwdy.diaryEntries.clear();
      dbDwdy.diaries.clear();
    });
    it("returns the prev/next diary entry ", async () => {
      const diary = await createDiary();
      const dIndexA = (await diary.appendEntry()).doc.dIndex;
      const dIndexB = (await diary.appendEntry()).doc.dIndex;
      const dIndexC = (await diary.appendEntry()).doc.dIndex;
      const entryA = await diary.fetchEntry({ dIndex: dIndexA });
      const entryB = await diary.fetchEntry({ dIndex: dIndexB });
      const entryC = await diary.fetchEntry({ dIndex: dIndexC });
      if (!entryA || !entryB || !entryC) {
        return;
      }
      expect(await entryA.prevEntry).toBeNull();
      expect(await entryA.nextEntry).not.toBeNull();
      expect(((await entryA.nextEntry) as DiaryEntry).doc.dIndex).toEqual(
        dIndexB
      );
      expect(await entryB.prevEntry).not.toBeNull();
      expect(((await entryB.prevEntry) as DiaryEntry).doc.dIndex).toEqual(
        dIndexA
      );
      expect(await entryB.nextEntry).not.toBeNull();
      expect(((await entryB.nextEntry) as DiaryEntry).doc.dIndex).toEqual(
        dIndexC
      );
      expect(await entryC.prevEntry).not.toBeNull();
      expect(((await entryC.prevEntry) as DiaryEntry).doc.dIndex).toEqual(
        dIndexB
      );
      expect(await entryC.nextEntry).toBeNull();
    });
  });
  describe("#save", () => {
    afterAll(() => {
      dbDwdy.diaryEntries.clear();
    });
    describe("when the instance has no dUid", () => {
      it("throws an invalid-params error with ['dUid']:required reason", async () => {
        const modelInst = build();
        try {
          await modelInst.save();
        } catch (err) {
          expect((err as InvalidParamsError).params).toEqual(["dUid"]);
          expect((err as InvalidParamsError).reason).toEqual("required");
        }
      });
    });
    describe("when the instance is a new instance", () => {
      it("stores the doc with the 'create' action", async () => {
        const diary = await createDiary();
        const entry = new DiaryEntry({
          dUid: diary.doc.dUid as string,
        });
        const result = await entry.save();
        expect(result.action).toEqual("create");
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
  describe("#tsDate", () => {
    describe("when timestamp exists", () => {
      it("returns the data coverted from timestamp", () => {
        const timestamp = Date.now();
        const entry = new DiaryEntry({}, { timestamp });
        const result = entryTsToDt(timestamp);
        expect(entry.tsDate).toEqual(result);
      });
    });
    describe("when no timestamp stored in entry", () => {
      it("returns null", () => {
        const entry = new DiaryEntry();
        expect(entry.tsDate).toBeNull();
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
  describe("#hasContentFeatures", () => {
    it("returns features where the entry has contents", () => {
      const dEntry = new DiaryEntry({});
      const dEntryDoc = build();
      const features = randomSample(TEST_CONTENT_FREATURES);
      features.forEach((feature) => {
        const contents = [...dEntryDoc.fetchContents(feature)];
        dEntry.assignContents(feature, contents);
      });
      expect(dEntry.hasContentFeatures).toEqual(features);
    });
  });
});
