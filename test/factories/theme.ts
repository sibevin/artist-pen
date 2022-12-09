import { randomPick } from "../support/randomUtils";
import { THEMES } from "~/services/theme";

export function random(): string {
  return randomPick<string>(THEMES);
}
