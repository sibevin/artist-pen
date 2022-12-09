import { randomPick } from "../support/randomUtils";
import { TIME_ZONES } from "~/services/timeZone";

export function random(): string {
  return randomPick<string>(TIME_ZONES);
}
