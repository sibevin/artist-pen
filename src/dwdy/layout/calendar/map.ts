import {
  mdiSortClockAscendingOutline,
  mdiSortClockDescendingOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { Icon, SelectionOption } from "~/models/app/types";
import { LocaleActor } from "~/services/locale";
import { SearchSortOpt, SEARCH_SORT_OPTS } from "~/dwdy/layout/calendar/def";

export const searchSortOptIconMap: Record<SearchSortOpt, Icon> = {
  ["timestamp_desc"]: {
    set: "mdi",
    path: mdiSortClockAscendingOutline,
  },
  ["timestamp_asc"]: {
    set: "mdi",
    path: mdiSortClockDescendingOutline,
  },
};

export function searchSortOpts(la: LocaleActor): SelectionOption[] {
  return SEARCH_SORT_OPTS.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(
        `dwdy.layout.calendar.config.searchSort.options.${localeKey}`
      ) as string,
      value: key,
      icon: searchSortOptIconMap[key],
    };
  });
}
