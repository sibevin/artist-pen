import { faker } from "@faker-js/faker";
import { randomPick, randomSample } from "../../support/randomUtils";
import { prepareModelFactory } from "../factoryUtils";
import {
  DiarySortedBy,
  WeekDay,
  DiaryTimelineOrder,
  DiaryFontFamily,
  DiaryFontFormatSize,
  WEEK_DAYS,
} from "~/models/dwdy/configOption";
import {
  DwdyConfigAttrs,
  DwdyConfigParams,
  DwdyConfig,
} from "~/models/dwdy/config";

export function buildAttrs(givenAttrs: DwdyConfigParams = {}): DwdyConfigAttrs {
  return Object.assign(
    {
      diariesSortedBy: randomPick(Object.keys(DiarySortedBy)),
      isContentMenuShown: faker.datatype.boolean(),
      recentStickerCodes: faker.lorem.words(),
      fontFamily: randomPick(Object.keys(DiaryFontFamily)),
      fontSize: randomPick(Object.keys(DiaryFontFormatSize)),
      fontLineHeight: randomPick(Object.keys(DiaryFontFormatSize)),
      fontLetterSpacing: randomPick(Object.keys(DiaryFontFormatSize)),
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
