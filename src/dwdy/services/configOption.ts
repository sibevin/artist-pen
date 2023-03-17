import {
  mdiSortAlphabeticalAscending,
  mdiSortClockAscendingOutline,
  mdiSortClockDescendingOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";

export const WEEK_DAYS = [...Array(7).keys()] as const;
export type WeekDay = typeof WEEK_DAYS[number];

export enum DiarySortedBy {
  TitleAsc = "title_asc",
  UpdateDesc = "update_desc",
}

export enum DiaryFontFamily {
  SansSerif = "sans_serif",
  Serif = "serif",
}

export enum DiaryFontFormatSize {
  XS = "xs",
  S = "s",
  M = "m",
  L = "l",
  XL = "xl",
}

export enum DiaryTimelineOrder {
  DIndexAsc = "d_index_asc",
  DIndexDesc = "d_index_desc",
}

export const diaryTimelineOrderIconMap: Record<DiaryTimelineOrder, Icon> = {
  [DiaryTimelineOrder.DIndexAsc]: {
    set: "mdi",
    path: mdiSortClockAscendingOutline,
  },
  [DiaryTimelineOrder.DIndexDesc]: {
    set: "mdi",
    path: mdiSortClockDescendingOutline,
  },
};

export const diarySortedByIconMap: Record<DiarySortedBy, Icon> = {
  [DiarySortedBy.TitleAsc]: { set: "mdi", path: mdiSortAlphabeticalAscending },
  [DiarySortedBy.UpdateDesc]: {
    set: "mdi",
    path: mdiSortClockAscendingOutline,
  },
};

export function timelineOrderOpts(la: LocaleActor): SelectionOption[] {
  return Object.values(DiaryTimelineOrder).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(
        `models.dwdy.config.enum.timelineOrder.${localeKey}`
      ) as string,
      value: key,
      icon: diaryTimelineOrderIconMap[key],
    };
  });
}

export function diarySortedByOpts(la: LocaleActor): SelectionOption[] {
  return Object.values(DiarySortedBy).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(
        `models.dwdy.config.enum.diariesSortedBy.${localeKey}`
      ) as string,
      value: key,
      icon: diarySortedByIconMap[key],
    };
  });
}

export function weekDayOpts(la: LocaleActor): SelectionOption[] {
  return WEEK_DAYS.map((wDay) => {
    return {
      labelShort: (
        la.t("dwdy.weekDays.short", {
          returnObjects: true,
        }) as string[]
      )[wDay],
      label: (
        la.t("dwdy.weekDays.long", {
          returnObjects: true,
        }) as string[]
      )[wDay],
      value: String(wDay),
    };
  });
}

export function fontFamilyOpts(la: LocaleActor): SelectionOption[] {
  return Object.values(DiaryFontFamily).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`models.dwdy.config.enum.fontFamily.${localeKey}`) as string,
      value: key,
    };
  });
}

export function fontFormatSizeOpts(la: LocaleActor): SelectionOption[] {
  return Object.values(DiaryFontFormatSize).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(
        `models.dwdy.config.enum.fontFormatSize.${localeKey}`
      ) as string,
      value: key,
    };
  });
}
