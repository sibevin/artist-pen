import {
  mdiFileDocumentOutline,
  mdiFileDocumentPlusOutline,
  mdiFileDocumentEditOutline,
} from "@mdi/js";
import camelCase from "lodash-es/camelCase";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/models/dwdy/feature";
import { Icon } from "~/models/app/types";

import {
  FEATURE_DEF as TextFeatureDef,
  FeatureMeta as TextFeatureMeta,
  FeatureStat as TextFeatureStat,
} from "~/models/dwdy/feature/text/index";
import {
  FEATURE_DEF as ImageFeatureDef,
  FeatureMeta as ImageFeatureMeta,
  FeatureStat as ImageFeatureStat,
} from "~/models/dwdy/feature/image/index";
import {
  FEATURE_DEF as SoundFeatureDef,
  FeatureMeta as SoundFeatureMeta,
  FeatureStat as SoundFeatureStat,
} from "~/models/dwdy/feature/sound/index";
import {
  FEATURE_DEF as StickerFeatureDef,
  FeatureMeta as StickerFeatureMeta,
  FeatureStat as StickerFeatureStat,
} from "~/models/dwdy/feature/sticker/index";
import {
  FEATURE_DEF as TagFeatureDef,
  FeatureMeta as TagFeatureMeta,
  FeatureStat as TagFeatureStat,
} from "~/models/dwdy/feature/tag/index";

export type DiaryFeatureDef = {
  flow: {
    creation: {
      uploader?: {
        upload: (file: File, data: string) => Promise<void>;
        multiple: boolean;
        accept?: string;
      };
      creator?: {
        create: () => Promise<void>;
      };
      customized?: boolean;
    };
    deletion: {
      delete?: (index: number) => Promise<void>;
    };
  };
  icon: {
    main: Icon;
    create: Icon;
    edit: Icon;
  };
  component: {
    editor?: any;
    gallery?: any;
    slate?: any;
    fullViewer?: any;
    listEntry?: any;
  };
};

export type DiaryContentEditorOpenParam = {
  feature: DiaryFeature;
  action?: "create" | "update";
  index?: number;
};

export type DiaryContentCreationParam = {
  action: "viewing" | "editing";
  index?: number;
};

type DiaryFeatureDefaultMeta = string;
type DiaryFeatureDefaultStat = {
  count: number;
  fileSize: number;
};

export type DiaryFeatureMetaMap = {
  [DiaryFeature.Text]: TextFeatureMeta;
  [DiaryFeature.Image]: ImageFeatureMeta;
  [DiaryFeature.Illustration]: DiaryFeatureDefaultMeta;
  [DiaryFeature.Sound]: SoundFeatureMeta;
  [DiaryFeature.Video]: DiaryFeatureDefaultMeta;
  [DiaryFeature.Sticker]: StickerFeatureMeta;
  [DiaryFeature.Tag]: TagFeatureMeta;
  [DiaryFeature.Location]: DiaryFeatureDefaultMeta;
  [DiaryFeature.TodoList]: DiaryFeatureDefaultMeta;
  [DiaryFeature.DataList]: DiaryFeatureDefaultMeta;
  [DiaryFeature.File]: DiaryFeatureDefaultMeta;
};

export type DiaryFeatureStatMap = {
  [DiaryFeature.Text]: TextFeatureStat;
  [DiaryFeature.Image]: ImageFeatureStat;
  [DiaryFeature.Illustration]: DiaryFeatureDefaultStat;
  [DiaryFeature.Sound]: SoundFeatureStat;
  [DiaryFeature.Video]: DiaryFeatureDefaultStat;
  [DiaryFeature.Sticker]: StickerFeatureStat;
  [DiaryFeature.Tag]: TagFeatureStat;
  [DiaryFeature.Location]: DiaryFeatureDefaultStat;
  [DiaryFeature.TodoList]: DiaryFeatureDefaultStat;
  [DiaryFeature.DataList]: DiaryFeatureDefaultStat;
  [DiaryFeature.File]: DiaryFeatureDefaultStat;
};

type ArrayizeMapValue<T> = {
  [Property in keyof T]: T[Property][];
};

export type DiaryFeatureContentMap = ArrayizeMapValue<DiaryFeatureMetaMap>;

const DiaryFeatureDefaultDef: DiaryFeatureDef = {
  flow: {
    creation: {},
    deletion: {},
  },
  icon: {
    main: { set: "mdi", path: mdiFileDocumentOutline },
    create: { set: "mdi", path: mdiFileDocumentPlusOutline },
    edit: { set: "mdi", path: mdiFileDocumentEditOutline },
  },
  component: {},
};

const featureDefMap: Record<DiaryFeature, DiaryFeatureDef> = {
  [DiaryFeature.Text]: TextFeatureDef,
  [DiaryFeature.Image]: ImageFeatureDef,
  [DiaryFeature.Illustration]: DiaryFeatureDefaultDef,
  [DiaryFeature.Sound]: SoundFeatureDef,
  [DiaryFeature.Video]: DiaryFeatureDefaultDef,
  [DiaryFeature.Sticker]: StickerFeatureDef,
  [DiaryFeature.Tag]: TagFeatureDef,
  [DiaryFeature.Location]: DiaryFeatureDefaultDef,
  [DiaryFeature.TodoList]: DiaryFeatureDefaultDef,
  [DiaryFeature.DataList]: DiaryFeatureDefaultDef,
  [DiaryFeature.File]: DiaryFeatureDefaultDef,
};

export function featureText(feature: DiaryFeature, la: LocaleActor): string {
  const localeKey = camelCase(feature);
  return la.t(`models.dwdy.diary.enum.feature.${localeKey}`) as string;
}

export function featureFlow(feature: DiaryFeature): DiaryFeatureDef["flow"] {
  const featureDef = featureDefMap[feature] || DiaryFeatureDefaultDef;
  return featureDef.flow;
}

export function featureIcon(
  feature: DiaryFeature,
  iconType: keyof DiaryFeatureDef["icon"] = "main"
): Icon {
  const featureDef = featureDefMap[feature] || DiaryFeatureDefaultDef;
  return featureDef.icon[iconType];
}

export function featureComponent(
  feature: DiaryFeature,
  componentType: keyof DiaryFeatureDef["component"] = "gallery"
) {
  const featureDef = featureDefMap[feature] || DiaryFeatureDefaultDef;
  return featureDef.component[componentType];
}
