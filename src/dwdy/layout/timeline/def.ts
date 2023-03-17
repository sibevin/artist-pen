import { SortOrder } from "~/dwdy/types/core";

export type LayoutConfig = {
  timelineOrder: SortOrder;
};

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  timelineOrder: "asc",
};
