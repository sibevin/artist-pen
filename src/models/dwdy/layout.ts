import {
  mdiCalendar,
  mdiTimeline,
  mdiBookOpenPageVariantOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";

export enum DiaryLayout {
  Calendar = "calendar",
  Timeline = "timeline",
  Notebook = "notebook",
}

export const TIME_BASED_LAYOUTS = [DiaryLayout.Calendar, DiaryLayout.Timeline];

export const PAGE_BASED_LAYOUTS = [DiaryLayout.Notebook];

export const layoutIconMap: Record<DiaryLayout, Icon> = {
  [DiaryLayout.Calendar]: { set: "mdi", path: mdiCalendar },
  [DiaryLayout.Timeline]: { set: "mdi", path: mdiTimeline },
  [DiaryLayout.Notebook]: { set: "mdi", path: mdiBookOpenPageVariantOutline },
};

export function layoutOpts(
  la: LocaleActor,
  pickedLayouts?: DiaryLayout[]
): SelectionOption[] {
  const opts = Object.values(DiaryLayout).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`models.dwdy.diary.enum.layout.${localeKey}`) as string,
      value: key,
      icon: layoutIconMap[key],
    };
  });
  if (pickedLayouts) {
    return opts.filter((opt) =>
      pickedLayouts.includes(opt.value as DiaryLayout)
    );
  } else {
    return opts;
  }
}
