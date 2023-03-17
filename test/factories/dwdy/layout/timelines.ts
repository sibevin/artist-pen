import { randomPick } from "../../../support/randomUtils";
import { SORT_ORDERS } from "~/dwdy/types/core";
import { LayoutConfig } from "~/dwdy/layout/timeline/def";

export function buildConfig(): LayoutConfig {
  return {
    timelineOrder: randomPick([...SORT_ORDERS]),
  };
}
