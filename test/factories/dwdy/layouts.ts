import { DiaryLayout } from "~/dwdy/layout/def";
import { DiaryLayoutConfigMap } from "~/dwdy/layout/map";
import * as CalendarBuilder from "./layout/calendars";
import * as TimelineBuilder from "./layout/timelines";
import * as NotebookBuilder from "./layout/notebooks";

const LAYOUT_BUILDER_MAP = {
  [DiaryLayout.Calendar]: CalendarBuilder,
  [DiaryLayout.Timeline]: TimelineBuilder,
  [DiaryLayout.Notebook]: NotebookBuilder,
};

export function buildConfig<T extends DiaryLayout>(
  feature: T
): DiaryLayoutConfigMap[T] {
  return LAYOUT_BUILDER_MAP[feature].buildConfig() as DiaryLayoutConfigMap[T];
}
