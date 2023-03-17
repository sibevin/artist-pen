import {
  mdiSortClockAscendingOutline,
  mdiSortClockDescendingOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { Icon, SelectionOption } from "~/models/app/types";
import { LocaleActor } from "~/services/locale";
import { SortOrder, SORT_ORDERS } from "~/dwdy/types/core";

export const diaryTimelineOrderIconMap: Record<SortOrder, Icon> = {
  ["asc"]: {
    set: "mdi",
    path: mdiSortClockAscendingOutline,
  },
  ["desc"]: {
    set: "mdi",
    path: mdiSortClockDescendingOutline,
  },
};

export function timelineOrderOpts(la: LocaleActor): SelectionOption[] {
  return SORT_ORDERS.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.layout.timeline.timelineOrder.${localeKey}`) as string,
      value: key,
      icon: diaryTimelineOrderIconMap[key],
    };
  });
}
