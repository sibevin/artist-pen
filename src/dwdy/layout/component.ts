import { DiaryLayout, DiaryLayoutComponent } from "~/dwdy/layout/def";
import { LAYOUT_COMPONENT as CALENDAR_LAYOUT_COMPONENT } from "~/dwdy/layout/calendar/component";
import { LAYOUT_COMPONENT as TIMELINE_LAYOUT_COMPONENT } from "~/dwdy/layout/timeline/component";
import { LAYOUT_COMPONENT as NOTEBOOK_LAYOUT_COMPONENT } from "~/dwdy/layout/notebook/component";

const DEFAULT_COMPONENT: DiaryLayoutComponent = {};

const LAYOUT_COMPONENT_MAP: Record<DiaryLayout, DiaryLayoutComponent> = {
  [DiaryLayout.Calendar]: CALENDAR_LAYOUT_COMPONENT,
  [DiaryLayout.Timeline]: TIMELINE_LAYOUT_COMPONENT,
  [DiaryLayout.Notebook]: NOTEBOOK_LAYOUT_COMPONENT,
};

export function layoutComponent(
  layout: DiaryLayout,
  componentType: keyof DiaryLayoutComponent
) {
  const layoutComponent = LAYOUT_COMPONENT_MAP[layout] || DEFAULT_COMPONENT;
  return layoutComponent[componentType];
}
