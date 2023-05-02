import { dbDwdy } from "~/services/db/dwdy";
import { DiaryEntryIdentityParams } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { getStringBytes } from "~/services/file";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  FeatureMeta,
  FeatureStat,
  DEFAULT_FEATURE_STAT,
} from "~/dwdy/feature/text/def";

async function updateDiaryTextStat(
  diary: Diary,
  statDelta: Partial<FeatureStat>
): Promise<void> {
  let stat = diary.fetchStat<DiaryFeature.Text>(DiaryFeature.Text);
  if (!stat) {
    if (statDelta.count && statDelta.count > 0) {
      stat = Object.assign({}, DEFAULT_FEATURE_STAT);
    } else {
      return;
    }
  }
  stat["count"] += statDelta.count || 0;
  stat["fileSize"] += statDelta.fileSize || 0;
  stat["words"] += statDelta.words || 0;
  stat["letters"] += statDelta.letters || 0;
  diary.assignStat<DiaryFeature.Text>(DiaryFeature.Text, stat);
  await diary.save();
}

function getTextBytes(text: FeatureMeta): number {
  return getStringBytes(text.raw) + getStringBytes(text.html);
}

function getTextWords(text: FeatureMeta): number {
  return text.raw.match(/(\w+)/g)?.length || 0;
}

function getTextLetters(text: FeatureMeta): number {
  return text.raw.replace(/\s/g, "").length;
}

export async function addText(
  dei: DiaryEntryIdentityParams,
  text: FeatureMeta
): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
      if (!fetchedResult) {
        return Promise<void>;
      }
      const { diary, entry } = fetchedResult;
      entry.appendContent<DiaryFeature.Text>(DiaryFeature.Text, text);
      await entry.save();
      await updateDiaryTextStat(diary, {
        count: 1,
        fileSize: getTextBytes(text),
        words: getTextWords(text),
        letters: getTextLetters(text),
      });
    }
  );
}

export async function deleteText(
  dei: DiaryEntryIdentityParams,
  index: number
): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
      if (!fetchedResult) {
        return Promise<void>;
      }
      const { diary, entry } = fetchedResult;
      const oriText = entry.fetchContent<DiaryFeature.Text>(
        DiaryFeature.Text,
        index
      );
      if (!oriText) {
        return;
      }
      entry.deleteContent(DiaryFeature.Text, index);
      await entry.save();
      await updateDiaryTextStat(diary, {
        count: -1,
        fileSize: -getTextBytes(oriText),
        words: -getTextWords(oriText),
        letters: -getTextLetters(oriText),
      });
    }
  );
}

export async function updateText(
  dei: DiaryEntryIdentityParams,
  text: FeatureMeta,
  index: number
): Promise<void> {
  await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const fetchedResult = await Diary.fetchDiaryAndEntry(dei);
      if (!fetchedResult) {
        return Promise<void>;
      }
      const { diary, entry } = fetchedResult;
      let oriText = entry.fetchContent<DiaryFeature.Text>(
        DiaryFeature.Text,
        index
      );
      if (!oriText) {
        oriText = { raw: "", html: "" };
      }
      entry.assignContent(DiaryFeature.Text, index, text);
      await entry.save();
      await updateDiaryTextStat(diary, {
        fileSize: getTextBytes(text) - getTextBytes(oriText),
        words: getTextWords(text) - getTextWords(oriText),
        letters: getTextLetters(text) - getTextLetters(oriText),
      });
    }
  );
}
