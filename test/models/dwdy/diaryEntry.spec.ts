import { describe, it, expect, afterAll } from "vitest";
import "fake-indexeddb/auto";
import { faker } from "@faker-js/faker";
import {
  DiaryEntry,
  DiaryEntryAttrs,
  DEFAULT_ATTRS,
} from "~/models/dwdy/diaryEntry";
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
import {
  checkFetchBehavior,
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsReadyToSaveBehavior,
  checkAssignBehavior,
} from "../../support/modelUtils";
import { genRandomIndex } from "../../support/randomUtils";

const TEST_SUPPORT_CONTENT_KEY_MAP: Record<string, DiaryFeature> = {
  essays: DiaryFeature.Essay,
  stickers: DiaryFeature.Sticker,
};

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
  checkFetchBehavior(
    (inst) => {
      const [dUid, dIndex] = (inst.uid as string).split("_");
      return DiaryEntry.fetch({ dUid, dIndex });
    },
    () => {
      dbDwdy.diaries.clear();
    },
    () => {
      return new DiaryEntry({ dUid: genUid(), dIndex: genRandomDIndex() });
    },
    create
  );
  checkConstructorBehavior(
    (attrs) => {
      return new DiaryEntry({}, attrs);
    },
    DEFAULT_ATTRS,
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
  checkIsReadyToSaveBehavior(
    () => {
      dbDwdy.diaries.clear();
    },
    build,
    create
  );
  checkAssignBehavior(buildAttrs, build);
  describe("#save", () => {
    afterAll(() => {
      dbDwdy.diaryEntries.clear();
    });
    describe("when the instance is a new instance", () => {
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
  describe("#fetchContents", () => {
    it("returns the contents with given feature", () => {
      const dEntry = build();
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const fetchedContents = dEntry.fetchContents(feature);
        const storedContents = dEntry.doc[contentKey as keyof DiaryEntryAttrs];
        expect(fetchedContents).toEqual(storedContents);
      });
    });
  });
  describe("#fetchContent", () => {
    it("returns the content with given feature and index", () => {
      const dEntry = build();
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const storedContents = dEntry.doc[contentKey as keyof DiaryEntryAttrs];
        const index = genRandomIndex(storedContents.length);
        const fetchedContent = dEntry.fetchContent(feature, index);
        expect(fetchedContent).toEqual(storedContents[index]);
      });
    });
    checkIndexValidationBehavior((index) => {
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const dEntry = build();
        dEntry.fetchContent(feature, index);
      });
    });
  });
  describe("#appendContent", () => {
    it("append the given value to contents with given feature", () => {
      const dEntry = build();
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const value = faker.datatype.string();
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const contents = [...dEntry.doc[contentKey as keyof DiaryEntryAttrs]];
        dEntry.appendContent(feature, value);
        contents.push(value);
        expect(dEntry.fetchContents(feature)).toEqual(contents);
      });
    });
  });
  describe("#assignContent", () => {
    it("assign the given value to contents with given feature and index", () => {
      const dEntry = build();
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const value = faker.datatype.string();
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const contents = dEntry.fetchContents(feature);
        const index = genRandomIndex(contents.length);
        dEntry.assignContent(feature, index, value);
        expect(dEntry.fetchContent(feature, index)).toEqual(value);
      });
    });
    checkIndexValidationBehavior((index) => {
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const dEntry = build();
        const value = faker.datatype.string();
        dEntry.assignContent(feature, index, value);
      });
    });
  });
  describe("#deleteContent", () => {
    it("delete the content with given feature and index", () => {
      const dEntry = build();
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const contents = [...dEntry.fetchContents(feature)];
        const index = genRandomIndex(contents.length);
        dEntry.deleteContent(feature, index);
        contents.splice(index, 1);
        expect(dEntry.fetchContents(feature)).toEqual(contents);
      });
    });
    checkIndexValidationBehavior((index) => {
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const dEntry = build();
        dEntry.deleteContent(feature, index);
      });
    });
  });
  describe("#moveContent", () => {
    it("move the content with given feature and index", () => {
      const dEntry = build();
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const contents = [...dEntry.fetchContents(feature)];
        const fromIndex = genRandomIndex(contents.length);
        const toIndex = genRandomIndex(contents.length);
        dEntry.moveContent(feature, fromIndex, toIndex);
        contents.splice(toIndex, 0, contents.splice(fromIndex, 1)[0]);
        expect(dEntry.fetchContents(feature)).toEqual(contents);
      });
    });
    checkIndexValidationBehavior((index) => {
      Object.keys(TEST_SUPPORT_CONTENT_KEY_MAP).forEach((contentKey) => {
        const feature = TEST_SUPPORT_CONTENT_KEY_MAP[contentKey];
        const dEntry = build();
        dEntry.moveContent(feature, index, index);
      });
    });
  });
});
