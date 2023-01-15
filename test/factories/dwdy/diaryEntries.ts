import { faker } from "@faker-js/faker";
import { prepareModelFactory } from "../factoryUtils";
import { randomSample, genRandomSize } from "../../support/randomUtils";
import { stickerMap } from "~/models/dwdy/sticker";
import { DIndex } from "~/models/dwdy/diary";
import { dtToDIndex } from "~/models/dwdy/dateUtils";
import { genUid } from "~/services/db";
import {
  DiaryEntryAttrs,
  DiaryEntryParams,
  DiaryEntry,
} from "~/models/dwdy/diaryEntry";

export function genRandomDIndex(): DIndex {
  return dtToDIndex(faker.datatype.datetime());
}

// NOTE: dexie cannot handle blob in test environment with fake-indexeddb
// Ref: https://github.com/dexie/Dexie.js/issues/647
export function buildAttrs(givenAttrs: DiaryEntryParams = {}): DiaryEntryAttrs {
  return Object.assign(
    {},
    {
      content: {
        text: genRandomSize(() => faker.lorem.paragraphs()),
        sticker: randomSample(Object.keys(stickerMap)),
      },
    },
    givenAttrs
  );
}

export const { build, create } = prepareModelFactory<
  DiaryEntry,
  DiaryEntryParams
>(
  buildAttrs,
  (attrs) => {
    return new DiaryEntry({}, attrs);
  },
  (entry) => {
    return new DiaryEntry(
      { dUid: genUid(), dIndex: genRandomDIndex() },
      entry.doc
    );
  }
);
