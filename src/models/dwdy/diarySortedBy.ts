import {
  mdiSortAlphabeticalAscending,
  mdiSortClockAscendingOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";

export enum DiarySortedBy {
  TitleAsc = "title_asc",
  UpdateDesc = "update_desc",
}

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
      label: la.t(
        `models.dwdy.config.enum.diariesSortedBy.${localeKey}`
      ) as string,
      value: key,
      icon: diarySortedByIconMap[key],
    };
  });
}
