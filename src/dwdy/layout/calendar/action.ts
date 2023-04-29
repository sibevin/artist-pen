import { mdiCircle } from "@mdi/js";
import { DiaryLayout } from "~/dwdy/layout/def";
import {
  DisplayIconFormat,
  LAYOUT_DISPLAY_FEATURES,
} from "~/dwdy/layout/calendar/def";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";

export function buildDisplayIcons(
  diary: Diary,
  entry: DiaryEntry
): DisplayIconFormat[] {
  if (!entry.hasContents) {
    return [];
  }
  const displayIcon = diary.fetchLayoutConfig(DiaryLayout.Calendar).displayIcon;
  let icons: DisplayIconFormat[] = [];
  if (displayIcon === "content") {
    for (const feature of LAYOUT_DISPLAY_FEATURES) {
      if (!diary.enabledFeatures.includes(feature)) {
        continue;
      }
      const contents = entry.fetchContents(feature);
      if (contents.length > 0) {
        icons.push({
          icon: featureIcon(feature),
          size: 1.2,
        });
      }
      if (icons.length > 0) {
        break;
      }
    }
  }
  if (displayIcon === "dot") {
    let contentLength = 0;
    for (const feature of LAYOUT_DISPLAY_FEATURES) {
      if (!diary.enabledFeatures.includes(feature)) {
        continue;
      }
      const contents = entry.fetchContents(feature);
      contentLength += contents.length;
    }
    const size = (contentLength / 20 + 1) * 0.5;
    icons.push({
      icon: { set: "mdi", path: mdiCircle },
      size: size >= 1.2 ? 1.2 : size,
    });
  }
  if (displayIcon === "sticker") {
    icons = entry
      .fetchContents<DiaryFeature.Sticker>(DiaryFeature.Sticker)
      .map((code) => {
        return { stickerCode: code };
      });
    icons = (icons[0] && [icons[0]]) || [];
  }
  return icons;
}
