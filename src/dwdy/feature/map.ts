import {
  mdiFileDocumentOutline,
  mdiFileDocumentPlusOutline,
  mdiFileDocumentEditOutline,
  mdiViewGallery,
  mdiViewSequential,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { Icon, SelectionOption } from "~/models/app/types";
import {
  DiaryFeature,
  DiaryFeatureIcon,
  DisplayMode,
  DISPLAY_MODES,
} from "~/dwdy/feature/def";

import {
  FeatureMeta as TextFeatureMeta,
  FeatureStat as TextFeatureStat,
  FeatureConfig as TextFeatureConfig,
  FEATURE_ICON as TEXT_FEATURE_ICON,
  DEFAULT_FEATURE_STAT as TEXT_DEFAULT_STAT,
  DEFAULT_FEATURE_CONFIG as TEXT_DEFAULT_CONFIG,
} from "~/dwdy/feature/text/def";
import {
  FeatureMeta as ImageFeatureMeta,
  FeatureStat as ImageFeatureStat,
  FeatureConfig as ImageFeatureConfig,
  FEATURE_ICON as IMAGE_FEATURE_ICON,
  DEFAULT_FEATURE_STAT as IMAGE_DEFAULT_STAT,
  DEFAULT_FEATURE_CONFIG as IMAGE_DEFAULT_CONFIG,
} from "~/dwdy/feature/image/def";
import {
  FeatureMeta as SoundFeatureMeta,
  FeatureStat as SoundFeatureStat,
  FeatureConfig as SoundFeatureConfig,
  FEATURE_ICON as SOUND_FEATURE_ICON,
  DEFAULT_FEATURE_STAT as SOUND_DEFAULT_STAT,
  DEFAULT_FEATURE_CONFIG as SOUND_DEFAULT_CONFIG,
} from "~/dwdy/feature/sound/def";
import {
  FeatureMeta as StickerFeatureMeta,
  FeatureStat as StickerFeatureStat,
  FeatureConfig as StickerFeatureConfig,
  FEATURE_ICON as STICKER_FEATURE_ICON,
  DEFAULT_FEATURE_STAT as STICKER_DEFAULT_STAT,
  DEFAULT_FEATURE_CONFIG as STICKER_DEFAULT_CONFIG,
} from "~/dwdy/feature/sticker/def";
import {
  FeatureMeta as TagFeatureMeta,
  FeatureStat as TagFeatureStat,
  FeatureConfig as TagFeatureConfig,
  FEATURE_ICON as TAG_FEATURE_ICON,
  DEFAULT_FEATURE_STAT as TAG_DEFAULT_STAT,
  DEFAULT_FEATURE_CONFIG as TAG_DEFAULT_CONFIG,
} from "~/dwdy/feature/tag/def";

export type DiaryFeatureMetaMap = {
  [DiaryFeature.Text]: TextFeatureMeta;
  [DiaryFeature.Image]: ImageFeatureMeta;
  [DiaryFeature.Sound]: SoundFeatureMeta;
  [DiaryFeature.Sticker]: StickerFeatureMeta;
  [DiaryFeature.Tag]: TagFeatureMeta;
};

export type DiaryFeatureStatMap = {
  [DiaryFeature.Text]: TextFeatureStat;
  [DiaryFeature.Image]: ImageFeatureStat;
  [DiaryFeature.Sound]: SoundFeatureStat;
  [DiaryFeature.Sticker]: StickerFeatureStat;
  [DiaryFeature.Tag]: TagFeatureStat;
};

export type DiaryFeatureConfigMap = {
  [DiaryFeature.Text]: TextFeatureConfig;
  [DiaryFeature.Image]: ImageFeatureConfig;
  [DiaryFeature.Sound]: SoundFeatureConfig;
  [DiaryFeature.Sticker]: StickerFeatureConfig;
  [DiaryFeature.Tag]: TagFeatureConfig;
};

type ArrayizeMapValue<T> = {
  [Property in keyof T]: T[Property][];
};

export type DiaryFeatureContentMap = ArrayizeMapValue<DiaryFeatureMetaMap>;

const DEFAULT_ICON: DiaryFeatureIcon = {
  main: { set: "mdi", path: mdiFileDocumentOutline },
  create: { set: "mdi", path: mdiFileDocumentPlusOutline },
  edit: { set: "mdi", path: mdiFileDocumentEditOutline },
};

const FEATURE_ICON_MAP: Record<DiaryFeature, DiaryFeatureIcon> = {
  [DiaryFeature.Text]: TEXT_FEATURE_ICON,
  [DiaryFeature.Image]: IMAGE_FEATURE_ICON,
  [DiaryFeature.Sound]: SOUND_FEATURE_ICON,
  [DiaryFeature.Sticker]: STICKER_FEATURE_ICON,
  [DiaryFeature.Tag]: TAG_FEATURE_ICON,
};

const DISPLAY_MODE_ICON_MAP: Record<DisplayMode, Icon> = {
  ["carousel"]: { set: "mdi", path: mdiViewGallery },
  ["list"]: { set: "mdi", path: mdiViewSequential },
};

const DEFAULT_FEATURE_STAT_MAP: DiaryFeatureStatMap = {
  text: TEXT_DEFAULT_STAT,
  image: IMAGE_DEFAULT_STAT,
  sound: SOUND_DEFAULT_STAT,
  sticker: STICKER_DEFAULT_STAT,
  tag: TAG_DEFAULT_STAT,
};

const DEFAULT_FEATURE_CONFIG_MAP: DiaryFeatureConfigMap = {
  text: TEXT_DEFAULT_CONFIG,
  image: IMAGE_DEFAULT_CONFIG,
  sound: SOUND_DEFAULT_CONFIG,
  sticker: STICKER_DEFAULT_CONFIG,
  tag: TAG_DEFAULT_CONFIG,
};

export const AVAILABLE_FEATURES: DiaryFeature[] = [
  DiaryFeature.Text,
  DiaryFeature.Image,
  DiaryFeature.Sound,
  DiaryFeature.Sticker,
  DiaryFeature.Tag,
];

export function featureText(feature: DiaryFeature, la: LocaleActor): string {
  const localeKey = camelCase(feature);
  return la.t(`dwdy.feature.${localeKey}.name`) as string;
}

export function featureIcon(
  feature: DiaryFeature,
  iconType: keyof DiaryFeatureIcon = "main"
): Icon {
  const featureIcon = FEATURE_ICON_MAP[feature] || DEFAULT_ICON;
  return featureIcon[iconType];
}

export function featureOpts(la: LocaleActor): SelectionOption[] {
  return AVAILABLE_FEATURES.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.feature.${localeKey}.name`) as string,
      value: key,
      icon: featureIcon(key),
    };
  });
}

export function displayOpts(la: LocaleActor): SelectionOption[] {
  return DISPLAY_MODES.map((key) => {
    const localeKey = camelCase(key);
    return {
      label: la.t(`dwdy.feature.config.display.options.${localeKey}`) as string,
      value: key,
      icon: DISPLAY_MODE_ICON_MAP[key],
    };
  });
}

export function defaultFeatureStat<T extends DiaryFeature>(
  feature: DiaryFeature
): DiaryFeatureStatMap[T] {
  return DEFAULT_FEATURE_STAT_MAP[feature] as DiaryFeatureStatMap[T];
}

export function defaultFeatureConfig<T extends DiaryFeature>(
  feature: DiaryFeature
): DiaryFeatureConfigMap[T] {
  return DEFAULT_FEATURE_CONFIG_MAP[feature] as DiaryFeatureConfigMap[T];
}
