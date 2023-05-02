import {
  mdiSortAlphabeticalAscending,
  mdiSortClockAscendingOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { Icon, SelectionOption } from "~/models/app/types";
import { LocaleActor } from "~/services/locale";
import { WEEK_DAYS } from "~/types/dwdy/core";
import {
  DiarySortedBy,
  DiaryFontFamily,
  DiaryFontFormatSize,
} from "~/dwdy/config/def";

export const diarySortedByIconMap: Record<DiarySortedBy, Icon> = {
  [DiarySortedBy.TitleAsc]: { set: "mdi", path: mdiSortAlphabeticalAscending },
  [DiarySortedBy.UpdateDesc]: {
    set: "mdi",
    path: mdiSortClockAscendingOutline,
  },
};

export function diarySortedByOpts(la: LocaleActor): SelectionOption[] {
  return Object.values(DiarySortedBy).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.config.diariesSortedBy.${localeKey}`) as string,
      value: key,
      icon: diarySortedByIconMap[key],
    };
  });
}

export function weekDayOpts(la: LocaleActor): SelectionOption[] {
  return WEEK_DAYS.map((wDay) => {
    return {
      labelShort: (
        la.t("dwdy.core.weekDays.short", {
          returnObjects: true,
        }) as string[]
      )[wDay],
      label: (
        la.t("dwdy.core.weekDays.long", {
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
      label: la.t(`dwdy.config.fontFamily.${localeKey}`) as string,
      value: key,
    };
  });
}

export function fontFormatSizeOpts(la: LocaleActor): SelectionOption[] {
  return Object.values(DiaryFontFormatSize).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.config.fontFormatSize.${localeKey}`) as string,
      value: key,
    };
  });
}
