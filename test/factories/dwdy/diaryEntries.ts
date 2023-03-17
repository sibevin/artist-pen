import { faker } from "@faker-js/faker";
import { prepareModelFactory } from "../factoryUtils";
import { randomSample, genRandomSize } from "../../support/randomUtils";
import { stickerMap } from "~/dwdy/feature/sticker/data";
import { DIndex } from "~/dwdy/types/core";
import { genUid } from "~/services/db";
import {
  DiaryEntryAttrs,
  DiaryEntryParams,
  DiaryEntry,
} from "~/models/dwdy/diaryEntry";

export function genRandomDIndex(): DIndex {
  return genUid();
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
        tag: genRandomSize(() => faker.lorem.word()),
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
