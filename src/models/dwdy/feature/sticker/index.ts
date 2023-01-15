import { bxsRdSticker, bxsRdStickerPlus } from "~/services/iconSetPath";
import { dbDwdy } from "~/services/db/dwdy";
import { getStringBytes } from "~/services/file";
import { addKey, deleteKey } from "~/services/distribution";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryEntryDoc } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryFeatureDef } from "~/models/dwdy/featureDef";
import ContentEditor from "~/components/dwdy/feature/sticker/ContentEditor.vue";
import ContentGallery from "~/components/dwdy/feature/sticker/ContentGallery.vue";

export type StickerValue = string;
export type FeatureMeta = string;
export type FeatureStat = {
  count: number; // total number of assigned stickers
  fileSize: number;
  distribution: Record<string, number>;
};

export const FEATURE_DEF: DiaryFeatureDef = {
  flow: {
    creation: {
      customized: true,
    },
    deletion: {},
  },
  icon: {
    main: { set: "bxs", path: bxsRdSticker },
    create: { set: "bxs", path: bxsRdStickerPlus },
    edit: { set: "bxs", path: bxsRdStickerPlus },
  },
  component: {
    editor: ContentEditor,
    gallery: ContentGallery,
  },
};

const DEFAULT_STAT = {
  count: 0,
  fileSize: 0,
  distribution: {},
};

const MAX_RECENT_STICKER_COUNT = 60;

async function createEntryWhenNotStored(): Promise<void> {
  const dwdyState = useDwdyState();
  if (!dwdyState.entry.value.isStored && dwdyState.entry.value.doc.dIndex) {
    const entry = await dwdyState.diary.value.insertNewEntryWithDIndexOrder(
      dwdyState.entry.value.doc.dIndex
    );
    dwdyState.updateEntryBunch(entry.doc);
  }
}

async function updateRecentStickers(sticker: string): Promise<void> {
  const dwdyState = useDwdyState();
  let recentStickers = [...dwdyState.config.value.doc.recentStickerCodes];
  const targetIndex = recentStickers.indexOf(sticker);
  if (targetIndex >= 0) {
    recentStickers.splice(targetIndex, 1);
  }
  recentStickers.unshift(sticker);
  recentStickers = recentStickers.slice(0, MAX_RECENT_STICKER_COUNT);
  dwdyState.config.value.assign({
    recentStickerCodes: recentStickers,
  });
  await dwdyState.config.value.save();
}

async function addStickerToDiaryEntryContent(
  sticker: StickerValue
): Promise<DiaryEntryDoc> {
  const dwdyState = useDwdyState();
  dwdyState.entry.value.appendContent(DiaryFeature.Sticker, sticker);
  await dwdyState.entry.value.save();
  return dwdyState.entry.value.doc;
}

async function addStickerToDiaryStat(sticker: StickerValue): Promise<void> {
  const dwdyState = useDwdyState();
  let stat = dwdyState.diary.value.fetchStat<DiaryFeature.Sticker>(
    DiaryFeature.Sticker
  );
  if (!stat) {
    stat = Object.assign({}, DEFAULT_STAT);
  }
  stat["count"] += 1;
  stat["fileSize"] += getStringBytes(sticker);
  stat["distribution"] = addKey(sticker, stat["distribution"]);
  dwdyState.diary.value.assignStat<DiaryFeature.Sticker>(
    DiaryFeature.Sticker,
    stat
  );
  await dwdyState.diary.value.save();
}

async function deleteStickersFromDiaryStat(
  stickers: StickerValue[]
): Promise<void> {
  if (stickers.length === 0) {
    return;
  }
  const dwdyState = useDwdyState();
  const stat = dwdyState.diary.value.fetchStat<DiaryFeature.Sticker>(
    DiaryFeature.Sticker
  );
  if (!stat) {
    return;
  }
  stickers.forEach((sticker) => {
    stat["count"] += -1;
    stat["fileSize"] += -getStringBytes(sticker);
    stat["distribution"] = deleteKey(sticker, stat["distribution"]);
  });
  dwdyState.diary.value.assignStat<DiaryFeature.Sticker>(
    DiaryFeature.Sticker,
    stat
  );
  await dwdyState.diary.value.save();
}

export async function addSticker(
  sticker: StickerValue
): Promise<StickerValue[]> {
  await createEntryWhenNotStored();
  return await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    dbDwdy.configs,
    async () => {
      const dwdyState = useDwdyState();
      const stickers =
        dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
          DiaryFeature.Sticker
        );
      const foundIndex = stickers.indexOf(sticker);
      let entryDoc: DiaryEntryDoc;
      if (foundIndex > 0) {
        dwdyState.entry.value.moveContent(
          DiaryFeature.Sticker,
          foundIndex,
          stickers.length - 1
        );
        await dwdyState.entry.value.save();
        entryDoc = dwdyState.entry.value.doc;
        dwdyState.updateEntryBunch(entryDoc);
      } else {
        await updateRecentStickers(sticker);
        entryDoc = await addStickerToDiaryEntryContent(sticker);
        dwdyState.updateEntryBunch(entryDoc);
      }
      await addStickerToDiaryStat(sticker);
      return dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
        DiaryFeature.Sticker
      );
    }
  );
}

export async function deleteSticker(index: number): Promise<StickerValue[]> {
  return await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      const sticker = dwdyState.entry.value.fetchContent<DiaryFeature.Sticker>(
        DiaryFeature.Sticker,
        index
      );
      dwdyState.entry.value.deleteContent(DiaryFeature.Sticker, index);
      await dwdyState.entry.value.save();
      await deleteStickersFromDiaryStat(sticker ? [sticker] : []);
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
      return dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
        DiaryFeature.Sticker
      );
    }
  );
}

export async function clearAllStickers(): Promise<void> {
  return await dbDwdy.transaction(
    "rw",
    dbDwdy.diaryEntries,
    dbDwdy.diaries,
    async () => {
      const dwdyState = useDwdyState();
      const stickers =
        dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
          DiaryFeature.Sticker
        );
      dwdyState.entry.value.assignContents(
        dwdyState.editingContent.value.feature,
        []
      );
      await dwdyState.entry.value.save();
      await deleteStickersFromDiaryStat(stickers);
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    }
  );
}

export async function listRecentStickers(): Promise<StickerValue[]> {
  const dwdyState = useDwdyState();
  return [...dwdyState.config.value.doc.recentStickerCodes];
}
