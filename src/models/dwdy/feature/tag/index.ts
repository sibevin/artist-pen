import { mdiTagPlus } from "@mdi/js";
import { dbDwdy } from "~/services/db/dwdy";
import { mdiRdTagHash } from "~/services/iconSetPath";
import { getStringBytes } from "~/services/file";
import { addKey, deleteKey, listKeys } from "~/services/distribution";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryEntryDoc } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryFeatureDef } from "~/models/dwdy/featureDef";
import ContentEditor from "~/components/dwdy/feature/tag/ContentEditor.vue";
import ContentGallery from "~/components/dwdy/feature/tag/ContentGallery.vue";
import ContentSlate from "~/components/dwdy/feature/tag/ContentSlate.vue";

export type TagValue = string;
export type FeatureMeta = TagValue;
export type FeatureStat = {
  count: number; // total number of assigned tags
  fileSize: number;
  distribution: Record<TagValue, number>;
};

export const FEATURE_DEF: DiaryFeatureDef = {
  flow: {
    creation: {
      customized: true,
    },
    deletion: {},
  },
  icon: {
    main: { set: "mdi", path: mdiRdTagHash },
    create: { set: "mdi", path: mdiTagPlus },
    edit: { set: "mdi", path: mdiTagPlus },
  },
  component: {
    editor: ContentEditor,
    gallery: ContentGallery,
    slate: ContentSlate,
  },
};

const DEFAULT_STAT = {
  count: 0,
  fileSize: 0,
  distribution: {},
};

async function createEntryWhenNotStored(): Promise<void> {
  const dwdyState = useDwdyState();
  if (!dwdyState.entry.value.isStored && dwdyState.entry.value.doc.dIndex) {
    const entry = await dwdyState.diary.value.insertNewEntryWithDIndexOrder(
      dwdyState.entry.value.doc.dIndex
    );
    dwdyState.updateEntryBunch(entry.doc);
  }
}

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

async function deleteTagFromDiaryStat(tag: TagValue): Promise<void> {
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
  await dwdyState.diary.value.save();
}

async function addTagToDwdyConfig(tag: TagValue): Promise<void> {
  const dwdyState = useDwdyState();
  let tagDis = dwdyState.config.value.doc.tagDistribution;
  tagDis = addKey(tag, tagDis);
  dwdyState.config.value.assign({ tagDistribution: tagDis });
  await dwdyState.config.value.save();
}

async function deleteTagFromDwdyConfig(tag: TagValue): Promise<void> {
  if (!tag) {
    return;
  }
  const dwdyState = useDwdyState();
  let tagDis = dwdyState.config.value.doc.tagDistribution;
  tagDis = deleteKey(tag, tagDis);
  dwdyState.config.value.assign({ tagDistribution: tagDis });
  await dwdyState.config.value.save();
}

export async function addTag(tag: TagValue): Promise<TagValue[]> {
  await createEntryWhenNotStored();
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
        dwdyState.updateEntryBunch(entryDoc);
      } else {
        entryDoc = await addTagToDiaryEntryContent(tag);
        await addTagToDiaryStat(tag);
        await addTagToDwdyConfig(tag);
        dwdyState.updateEntryBunch(entryDoc);
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
      await deleteTagFromDiaryStat(tag);
      await deleteTagFromDwdyConfig(tag);
      dwdyState.updateEntryBunch(entryDoc);
      return dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
        DiaryFeature.Tag
      );
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
