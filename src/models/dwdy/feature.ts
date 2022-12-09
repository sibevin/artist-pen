import {
  mdiTextBox,
  mdiDraw,
  mdiMicrophone,
  mdiVideo,
  mdiOrderBoolAscendingVariant,
  mdiChartBar,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import {
  mdiRdImage,
  bxsSticker,
  mdiRdTagHash,
  mdiRdMapLocation,
} from "~/services/iconSetPath";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";

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
  [DiaryFeature.Sticker]: { set: "mdi", path: bxsSticker },
  [DiaryFeature.Tag]: { set: "mdi", path: mdiRdTagHash },
  [DiaryFeature.Location]: { set: "mdi", path: mdiRdMapLocation },
  [DiaryFeature.TodoList]: { set: "mdi", path: mdiOrderBoolAscendingVariant },
  [DiaryFeature.DataList]: { set: "mdi", path: mdiChartBar },
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
