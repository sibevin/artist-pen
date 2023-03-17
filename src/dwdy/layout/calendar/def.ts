import { WeekDay } from "~/dwdy/types/core";
import { DisplayIcon } from "~/dwdy/layout/def";

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
