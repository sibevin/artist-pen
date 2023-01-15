import { faker } from "@faker-js/faker";
import {
  randomPick,
  randomSample,
  genRandomIndex,
} from "../../support/randomUtils";
import { prepareModelFactory } from "../factoryUtils";
import {
  DiaryAttrs,
  DiaryParams,
  Diary,
  DEFAULT_ATTRS,
  DiaryTemplate,
  DEFAULT_TEMPLATE,
} from "~/models/dwdy/diary";
import { DiaryFeature, AVAILABLE_FEATURES } from "~/models/dwdy/feature";
import { DiaryLayout } from "~/models/dwdy/layout";
import {
  WeekDay,
  DiaryTimelineOrder,
  WEEK_DAYS,
} from "~/models/dwdy/configOption";

export function buildAttrs(givenAttrs: DiaryParams = {}): DiaryAttrs {
  const enabledFeatures: DiaryFeature[] =
    randomSample<DiaryFeature>(AVAILABLE_FEATURES);
  const efSplitIndex = genRandomIndex(enabledFeatures.length);
  const template = {
    mobile: enabledFeatures,
    desktop: {
      left: enabledFeatures.slice(0, efSplitIndex),
      right: enabledFeatures.slice(efSplitIndex - enabledFeatures.length),
    },
  };
  return Object.assign(
    {
      title: faker.lorem.sentence(),
      entryCount: faker.datatype.number(),
      layout: randomPick(Object.keys(DiaryLayout)),
      highlightedWeekDays: randomSample(WEEK_DAYS as WeekDay[]),
      firstWeekDay: randomPick(WEEK_DAYS as WeekDay[]) as WeekDay,
      isWeekShown: faker.datatype.boolean(),
      timelineOrder: randomPick(Object.keys(DiaryTimelineOrder)),
      template,
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

export function buildDefaultDocAttrs(): DiaryParams {
  const template: DiaryTemplate = Object.assign({}, DEFAULT_TEMPLATE);
  template.mobile = (template.mobile as DiaryFeature[]).filter((feature) =>
    AVAILABLE_FEATURES.includes(feature)
  );
  template.desktop.left = (template.desktop.left as DiaryFeature[]).filter(
    (feature) => AVAILABLE_FEATURES.includes(feature)
  );
  template.desktop.right = (template.desktop.right as DiaryFeature[]).filter(
    (feature) => AVAILABLE_FEATURES.includes(feature)
  );

  return Object.assign({}, DEFAULT_ATTRS, { template }) as DiaryParams;
}
