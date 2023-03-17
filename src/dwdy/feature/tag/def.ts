import { mdiTagPlus } from "@mdi/js";
import { mdiRdTagHash } from "~/services/iconSetPath";
import { DiaryFeatureIcon } from "~/dwdy/feature/def";

export type TagValue = string;

export type FeatureMeta = TagValue;

export type FeatureStat = {
  count: number; // total number of assigned tags
  fileSize: number;
  distribution: Record<TagValue, number>;
};

export type FeatureConfig = {
  recentRecords: FeatureMeta[];
};

export const FEATURE_ICON: DiaryFeatureIcon = {
  main: { set: "mdi", path: mdiRdTagHash },
  create: { set: "mdi", path: mdiTagPlus },
  edit: { set: "mdi", path: mdiTagPlus },
};

export const DEFAULT_FEATURE_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
  distribution: {},
};

export const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
  recentRecords: [],
};
