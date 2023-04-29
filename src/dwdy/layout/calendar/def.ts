import { WeekDay } from "~/dwdy/types/core";
import { DisplayIcon } from "~/dwdy/layout/def";
import { DiaryFeature } from "~/dwdy/feature/def";
import { Icon } from "~/models/app/types";

export type LayoutConfig = {
  isCalendarShown: boolean;
  firstWeekDay: WeekDay;
  displayIcon: DisplayIcon;
};

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  isCalendarShown: true,
  firstWeekDay: 0,
  displayIcon: "dot",
};

export type DisplayIconFormat = {
  stickerCode?: string;
  icon?: Icon;
  size?: number;
};

export const LAYOUT_DISPLAY_FEATURES: DiaryFeature[] = [
  DiaryFeature.Image,
  DiaryFeature.Sound,
  DiaryFeature.Text,
  DiaryFeature.Sticker,
  DiaryFeature.Tag,
];

export const SEARCH_SORT_OPTS = ["timestamp_desc", "timestamp_asc"] as const;
export type SearchSortOpt = typeof SEARCH_SORT_OPTS[number];
