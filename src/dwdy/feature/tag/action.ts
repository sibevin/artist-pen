import { dbDwdy } from "~/services/db/dwdy";
import { useDwdyState } from "~/states/useDwdyState";
import { addKey, deleteKey, listKeys } from "~/services/distribution";
import { DiaryEntryDoc } from "~/models/dwdy/diaryEntry";
import { getStringBytes } from "~/services/file";
import { DiaryFeature } from "~/dwdy/feature/def";
import { TagValue } from "~/dwdy/feature/tag/def";

const DEFAULT_STAT = {
  count: 0,
  fileSize: 0,
  distribution: {},
};

async function addTagToDiaryEntryContent(
  tag: TagValue
): Promise<DiaryEntryDoc> {
  const dwdyState = useDwdyState();
  dwdyState.entry.value.appendContent(DiaryFeature.Tag, tag);
  await dwdyState.entry.value.save();
  return dwdyState.entry.value.doc;
}

async function deleteTagFromDiaryEntryContent(
  index: number
): Promise<DiaryEntryDoc> {
  const dwdyState = useDwdyState();
  dwdyState.entry.value.deleteContent(DiaryFeature.Tag, index);
  await dwdyState.entry.value.save();
  return dwdyState.entry.value.doc;
}

async function addTagToDiaryStat(tag: TagValue): Promise<void> {
  const dwdyState = useDwdyState();
  let stat = dwdyState.diary.value.fetchStat<DiaryFeature.Tag>(
    DiaryFeature.Tag
  );
  if (!stat) {
    stat = Object.assign({}, DEFAULT_STAT);
  }
  stat["count"] += 1;
  stat["fileSize"] += getStringBytes(tag);
  stat["distribution"] = addKey(tag, stat["distribution"]);
  dwdyState.diary.value.assignStat<DiaryFeature.Tag>(DiaryFeature.Tag, stat);
  await dwdyState.diary.value.save();
}

function deleteTagFromDiaryStat(tag: TagValue): void {
  if (!tag) {
    return;
  }
  const dwdyState = useDwdyState();
  const stat = dwdyState.diary.value.fetchStat<DiaryFeature.Tag>(
    DiaryFeature.Tag
  );
  if (!stat) {
    return;
  }
  stat["count"] += -1;
  stat["fileSize"] += -getStringBytes(tag);
  stat["distribution"] = deleteKey(tag, stat["distribution"]);
  dwdyState.diary.value.assignStat<DiaryFeature.Tag>(DiaryFeature.Tag, stat);
}

async function addTagToDwdyConfig(tag: TagValue): Promise<void> {
  const dwdyState = useDwdyState();
  let tagDis = dwdyState.config.value.doc.tagDistribution;
  tagDis = addKey(tag, tagDis);
  dwdyState.config.value.assign({ tagDistribution: tagDis });
  await dwdyState.config.value.save();
}

function deleteTagFromDwdyConfig(tag: TagValue): void {
  if (!tag) {
    return;
  }
  const dwdyState = useDwdyState();
  let tagDis = dwdyState.config.value.doc.tagDistribution;
  tagDis = deleteKey(tag, tagDis);
  dwdyState.config.value.assign({ tagDistribution: tagDis });
}

export async function addTag(tag: TagValue): Promise<TagValue[]> {
  return await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    dbDwdy.configs,
    async () => {
      const dwdyState = useDwdyState();
      const tags = dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
        DiaryFeature.Tag
      );
      const foundIndex = tags.indexOf(tag);
      let entryDoc: DiaryEntryDoc;
      if (foundIndex > 0) {
        dwdyState.entry.value.moveContent(
          DiaryFeature.Tag,
          foundIndex,
          tags.length - 1
        );
        await dwdyState.entry.value.save();
        entryDoc = dwdyState.entry.value.doc;
        dwdyState.updateEntry(entryDoc);
      } else {
        entryDoc = await addTagToDiaryEntryContent(tag);
        await addTagToDiaryStat(tag);
        await addTagToDwdyConfig(tag);
        dwdyState.updateEntry(entryDoc);
      }
      return dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
        DiaryFeature.Tag
      );
    }
  );
}

export async function deleteTag(index: number): Promise<TagValue[]> {
  return await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    dbDwdy.configs,
    async () => {
      const dwdyState = useDwdyState();
      const tag = dwdyState.entry.value.fetchContent<DiaryFeature.Tag>(
        DiaryFeature.Tag,
        index
      );
      const entryDoc = await deleteTagFromDiaryEntryContent(index);
      deleteTagFromDiaryStat(tag);
      deleteTagFromDwdyConfig(tag);
      await dwdyState.diary.value.save();
      await dwdyState.config.value.save();
      dwdyState.updateEntry(entryDoc);
      return dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
        DiaryFeature.Tag
      );
    }
  );
}

export async function deleteAllTags(): Promise<void> {
  return await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    dbDwdy.configs,
    async () => {
      const dwdyState = useDwdyState();
      const tags = dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
        DiaryFeature.Tag
      );
      dwdyState.entry.value.assignContents(DiaryFeature.Tag, []);
      await dwdyState.entry.value.save();
      dwdyState.updateEntry(dwdyState.entry.value.doc);
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        deleteTagFromDiaryStat(tag);
        deleteTagFromDwdyConfig(tag);
      }
      await dwdyState.diary.value.save();
      await dwdyState.config.value.save();
    }
  );
}

export async function listCandidateTags(): Promise<TagValue[]> {
  const dwdyState = useDwdyState();
  return listKeys(dwdyState.config.value.doc.tagDistribution);
}

export function normalizeTag(tag: TagValue): TagValue {
  return tag.replace(/[# ]/g, "");
}

export function buildTagQuery(tag: TagValue): string {
  return `#${tag}`;
}
