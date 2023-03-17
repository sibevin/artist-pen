import { DiaryFeature } from "~/dwdy/feature/def";
import {
  DiaryFeatureContentMap,
  DiaryFeatureStatMap,
  DiaryFeatureConfigMap,
} from "~/dwdy/feature/map";
import * as TextBuilder from "./feature/texts";
import * as ImageBuilder from "./feature/images";
import * as SoundBuilder from "./feature/sounds";
import * as StickerBuilder from "./feature/stickers";
import * as TagBuilder from "./feature/tags";
import { genRandomSize } from "test/support/randomUtils";

const FEATURE_BUILDER_MAP = {
  [DiaryFeature.Text]: TextBuilder,
  [DiaryFeature.Image]: ImageBuilder,
  [DiaryFeature.Sound]: SoundBuilder,
  [DiaryFeature.Sticker]: StickerBuilder,
  [DiaryFeature.Tag]: TagBuilder,
};

export function buildContents<T extends DiaryFeature>(
  feature: T
): DiaryFeatureContentMap[T] {
  const contentBuilderFn = FEATURE_BUILDER_MAP[feature].buildContent;
  return genRandomSize(() => {
    return contentBuilderFn();
  }) as DiaryFeatureContentMap[T];
}

export function buildStat<T extends DiaryFeature>(
  feature: T
): DiaryFeatureStatMap[T] {
  return FEATURE_BUILDER_MAP[feature].buildStat() as DiaryFeatureStatMap[T];
}

export function buildConfig<T extends DiaryFeature>(
  feature: T
): DiaryFeatureConfigMap[T] {
  return FEATURE_BUILDER_MAP[feature].buildConfig() as DiaryFeatureConfigMap[T];
}
