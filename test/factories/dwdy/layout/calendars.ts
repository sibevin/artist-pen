import { faker } from "@faker-js/faker";
import { randomPick } from "../../../support/randomUtils";
import { WEEK_DAYS } from "~/types/dwdy/core";
import { LayoutConfig } from "~/dwdy/layout/calendar/def";

export function buildConfig(): LayoutConfig {
  return {
    isCalendarShown: faker.datatype.boolean(),
    firstWeekDay: randomPick([...WEEK_DAYS]),
  };
}
