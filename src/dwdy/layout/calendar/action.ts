import { mdiCircle } from "@mdi/js";
import {
  DisplayIconFormat,
  LAYOUT_DISPLAY_FEATURES,
} from "~/dwdy/layout/calendar/def";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/dwdy/feature/def";
import { stickerCategories } from "~/dwdy/feature/sticker/data";

export function buildDisplayIcons(
  diary: Diary,
  entry: DiaryEntry
): DisplayIconFormat[] {
  if (!entry.hasContents) {
    return [];
  }
  let icons: DisplayIconFormat[] = [];
  if (
    !diary.enabledFeatures.includes(DiaryFeature.Sticker) ||
    diary.fetchFeatureConfig(DiaryFeature.Sticker).displayIconTarget === "none"
  ) {
    icons = fetchDotDisplay(diary, entry);
  } else {
    icons = fetchStickerDisplay(diary, entry);
    if (icons.length === 0) {
      icons = fetchDotDisplay(diary, entry);
    }
  }
  return icons;
}

function fetchDotDisplay(diary: Diary, entry: DiaryEntry): DisplayIconFormat[] {
  const icons: DisplayIconFormat[] = [];
  let contentLength = 0;
  for (const feature of LAYOUT_DISPLAY_FEATURES) {
    if (!diary.enabledFeatures.includes(feature)) {
      continue;
    }
    const contents = entry.fetchContents(feature);
    contentLength += contents.length;
  }
  if (contentLength === 0) {
    return [];
  }
  const size = (contentLength / 20 + 1) * 0.5;
  icons.push({
    icon: { set: "mdi", path: mdiCircle },
    size: size >= 1.2 ? 1.2 : size,
  });
  return icons;
}

function fetchStickerDisplay(
  diary: Diary,
  entry: DiaryEntry
): DisplayIconFormat[] {
  let icons: DisplayIconFormat[] = [];
  const displayIconTarget = diary.fetchFeatureConfig(
    DiaryFeature.Sticker
  ).displayIconTarget;
  if (displayIconTarget === "first") {
    icons = entry
      .fetchContents<DiaryFeature.Sticker>(DiaryFeature.Sticker)
      .map((code) => {
        return { stickerCode: code };
      });
  } else {
    icons = entry
      .fetchContents<DiaryFeature.Sticker>(DiaryFeature.Sticker)
      .filter((code) => getCategoryStickers(displayIconTarget).includes(code))
      .map((code) => {
        return { stickerCode: code };
      });
  }
  icons = (icons[0] && [icons[0]]) || [];
  return icons;
}

function getCategoryStickers(categoryCode: string): string[] {
  for (let i = 0; i < stickerCategories.length; i++) {
    const category = stickerCategories[i];
    if (category.code === categoryCode) {
      return category.stickerCodes;
    }
  }
  return [];
}
