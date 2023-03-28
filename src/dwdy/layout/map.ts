import {
  mdiCalendar,
  mdiTimeline,
  mdiBookOpenPageVariantOutline,
  mdiChartBubble,
  mdiCheckboxMultipleBlank,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";
import { DiaryLayout, DISPLAY_ICONS, DisplayIcon } from "~/dwdy/layout/def";

import {
  LayoutConfig as CalendarLayoutConfig,
  DEFAULT_LAYOUT_CONFIG as CALENDAR_DEFAULT_CONFIG,
} from "~/dwdy/layout/calendar/def";
import {
  LayoutConfig as TimelineLayoutConfig,
  DEFAULT_LAYOUT_CONFIG as TIMELINE_DEFAULT_CONFIG,
} from "~/dwdy/layout/timeline/def";
import {
  LayoutConfig as NotebookLayoutConfig,
  DEFAULT_LAYOUT_CONFIG as NOTEBOOK_DEFAULT_CONFIG,
} from "~/dwdy/layout/notebook/def";
import { bxsRdSticker } from "~/services/iconSetPath";

export type DiaryLayoutConfigMap = {
  [DiaryLayout.Calendar]: CalendarLayoutConfig;
  [DiaryLayout.Timeline]: TimelineLayoutConfig;
  [DiaryLayout.Notebook]: NotebookLayoutConfig;
};

const DEFAULT_LAYOUT_CONFIG_MAP: DiaryLayoutConfigMap = {
  calendar: CALENDAR_DEFAULT_CONFIG,
  timeline: TIMELINE_DEFAULT_CONFIG,
  notebook: NOTEBOOK_DEFAULT_CONFIG,
};

const LAYOUT_ICON_MAP: Record<DiaryLayout, Icon> = {
  [DiaryLayout.Calendar]: { set: "mdi", path: mdiCalendar },
  [DiaryLayout.Timeline]: { set: "mdi", path: mdiTimeline },
  [DiaryLayout.Notebook]: { set: "mdi", path: mdiBookOpenPageVariantOutline },
};

const DISPLAY_ICON_MAP: Record<DisplayIcon, Icon> = {
  ["dot"]: { set: "mdi", path: mdiChartBubble },
  ["content"]: { set: "mdi", path: mdiCheckboxMultipleBlank },
  ["sticker"]: { set: "bxs", path: bxsRdSticker },
};

export function layoutText(layout: DiaryLayout, la: LocaleActor): string {
  const localeKey = camelCase(layout);
  return la.t(`dwdy.layout.${localeKey}.name`) as string;
}

export function layoutIcon(layout: DiaryLayout): Icon {
  return LAYOUT_ICON_MAP[layout];
}

export function layoutOpts(
  la: LocaleActor,
  pickedLayouts?: DiaryLayout[]
): SelectionOption[] {
  const opts = Object.values(DiaryLayout).map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.layout.${localeKey}.name`) as string,
      value: key,
      icon: layoutIcon(key),
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

export function defaultLayoutConfig<T extends DiaryLayout>(
  layout: DiaryLayout
): DiaryLayoutConfigMap[T] {
  return DEFAULT_LAYOUT_CONFIG_MAP[layout] as DiaryLayoutConfigMap[T];
}

export function displayIconOpts(la: LocaleActor): SelectionOption[] {
  return DISPLAY_ICONS.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(
        `dwdy.layout.config.displayIcon.options.${localeKey}`
      ) as string,
      value: key,
      icon: DISPLAY_ICON_MAP[key],
    };
  });
}
