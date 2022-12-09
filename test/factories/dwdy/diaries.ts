import { faker } from "@faker-js/faker";
import { randomPick, randomSample } from "../../support/randomUtils";
import { prepareModelFactory } from "../factoryUtils";
import { DiaryAttrs, DiaryParams, Diary } from "~/models/dwdy/diary";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryLayout } from "~/models/dwdy/layout";
import { WeekDay, DiaryTimelineOrder, WEEK_DAYS } from "~/models/dwdy/config";

export function buildAttrs(givenAttrs: DiaryParams = {}): DiaryAttrs {
  return Object.assign(
    {
      title: faker.lorem.sentence(),
      entryCount: faker.datatype.number(),
      enabledFeatures: randomSample(Object.keys(DiaryFeature)),
      layout: randomPick(Object.keys(DiaryLayout)),
      highlightedWeekDays: randomSample(WEEK_DAYS as WeekDay[]),
      firstWeekDay: randomPick(WEEK_DAYS as WeekDay[]) as WeekDay,
      isWeekShown: faker.datatype.boolean(),
      timelineOrder: randomPick(Object.keys(DiaryTimelineOrder)),
    },
    givenAttrs
  );
}

export const { build, create } = prepareModelFactory<Diary, DiaryParams>(
  buildAttrs,
  (attrs) => {
    return new Diary(attrs);
  }
);
