import {
  mdiTextBox,
  mdiDraw,
  mdiMicrophone,
  mdiVideo,
  mdiOrderBoolAscendingVariant,
  mdiChartBar,
  mdiFileCabinet,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import {
  mdiRdImage,
  bxsRdSticker,
  mdiRdTagHash,
  mdiRdMapLocation,
} from "~/services/iconSetPath";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";
import { InvalidParamsError } from "~/models/app/error";

export enum DiaryFeature {
  Text = "text",
  Image = "image",
  Sound = "sound",
  Video = "video",
  Illustration = "illustration",
  Sticker = "sticker",
  Tag = "tag",
  Location = "location",
  TodoList = "todo_list",
  DataList = "data_list",
  File = "file",
}

export const AVAILABLE_FEATURES: DiaryFeature[] = [
  DiaryFeature.Text,
  DiaryFeature.Image,
  DiaryFeature.Sound,
  DiaryFeature.Sticker,
  DiaryFeature.Tag,
];

export const featureIconMap: Record<DiaryFeature, Icon> = {
  [DiaryFeature.Text]: { set: "mdi", path: mdiTextBox },
  [DiaryFeature.Image]: { set: "mdi", path: mdiRdImage },
  [DiaryFeature.Illustration]: { set: "mdi", path: mdiDraw },
  [DiaryFeature.Sound]: { set: "mdi", path: mdiMicrophone },
  [DiaryFeature.Video]: { set: "mdi", path: mdiVideo },
  [DiaryFeature.Sticker]: { set: "mdi", path: bxsRdSticker },
  [DiaryFeature.Tag]: { set: "mdi", path: mdiRdTagHash },
  [DiaryFeature.Location]: { set: "mdi", path: mdiRdMapLocation },
  [DiaryFeature.TodoList]: { set: "mdi", path: mdiOrderBoolAscendingVariant },
  [DiaryFeature.DataList]: { set: "mdi", path: mdiChartBar },
  [DiaryFeature.File]: { set: "mdi", path: mdiFileCabinet },
};

export function featureOpts(la: LocaleActor): SelectionOption[] {
  return AVAILABLE_FEATURES.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`models.dwdy.diary.enum.feature.${localeKey}`) as string,
      value: key,
      icon: featureIconMap[key],
    };
  });
}

function checkContentIndex<T>(metaArr: T[], index: number): void {
  if (index < 0 || index >= metaArr.length) {
    throw new InvalidParamsError({
      params: ["index"],
      reason: "invalid",
    });
  }
}

export function loadFeatureContent<T>(metaArr: T[], index: number): T {
  checkContentIndex(metaArr, index);
  return metaArr[index];
}
export function createFeatureContent<T>(metaArr: T[], meta: T): T[] {
  metaArr.push(meta);
  return metaArr;
}
export function updateFeatureContent<T>(
  metaArr: T[],
  index: number,
  meta: T
): T[] {
  checkContentIndex(metaArr, index);
  metaArr[index] = meta;
  return metaArr;
}
export function moveFeatureContent<T>(
  metaArr: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  checkContentIndex(metaArr, fromIndex);
  checkContentIndex(metaArr, toIndex);
  metaArr.splice(toIndex, 0, metaArr.splice(fromIndex, 1)[0]);
  return metaArr;
}
export function deleteFeatureContent<T>(metaArr: T[], index: number): T[] {
  checkContentIndex(metaArr, index);
  metaArr.splice(index, 1);
  return metaArr;
}
