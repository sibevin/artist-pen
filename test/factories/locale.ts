import { randomPick } from "../support/randomUtils";
import { LOCALE_DATA } from "~/services/locale";

export function random(): string {
  return randomPick<string>(Object.keys(LOCALE_DATA));
}
