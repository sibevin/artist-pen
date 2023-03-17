import { mdiRepeat, mdiRepeatOff, mdiRepeatOnce } from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";
import { RepeatMode, REPEAT_MODES } from "~/dwdy/feature/sound/def";

const REPEAT_ICON_MAP: Record<RepeatMode, Icon> = {
  ["none"]: { set: "mdi", path: mdiRepeatOff },
  ["single"]: { set: "mdi", path: mdiRepeatOnce },
  ["all"]: { set: "mdi", path: mdiRepeat },
};

export function repeatOpts(la: LocaleActor): SelectionOption[] {
  return REPEAT_MODES.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.feature.sound.repeatMode.${localeKey}`) as string,
      value: key,
      icon: REPEAT_ICON_MAP[key],
    };
  });
}
