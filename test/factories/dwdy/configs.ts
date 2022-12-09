import { faker } from "@faker-js/faker";
import { randomPick, randomSample } from "../../support/randomUtils";
import { prepareModelFactory } from "../factoryUtils";
import { DiarySortedBy } from "~/models/dwdy/diarySortedBy";
import {
  DwdyConfigAttrs,
  DwdyConfigParams,
  DwdyConfig,
  WeekDay,
  DiaryTimelineOrder,
  FontFamily,
  FontFormatSize,
  WEEK_DAYS,
} from "~/models/dwdy/config";

export function buildAttrs(givenAttrs: DwdyConfigParams = {}): DwdyConfigAttrs {
  return Object.assign(
    {
      diariesSortedBy: randomPick(Object.keys(DiarySortedBy)),
      isContentMenuShown: faker.datatype.boolean(),
      recentStickerCodes: faker.lorem.words(),
      fontFamily: randomPick(Object.keys(FontFamily)),
      fontSize: randomPick(Object.keys(FontFormatSize)),
      fontLineHeight: randomPick(Object.keys(FontFormatSize)),
      fontLetterSpacing: randomPick(Object.keys(FontFormatSize)),
      highlightedWeekDays: randomSample(WEEK_DAYS as WeekDay[]),
      firstWeekDay: randomPick(WEEK_DAYS as WeekDay[]) as WeekDay,
      isWeekShown: faker.datatype.boolean(),
      timelineOrder: randomPick(Object.keys(DiaryTimelineOrder)),
    },
    givenAttrs
  );
}

export const { build, create } = prepareModelFactory<
  DwdyConfig,
  DwdyConfigParams
>(buildAttrs, (attrs) => {
  return new DwdyConfig(attrs);
});
