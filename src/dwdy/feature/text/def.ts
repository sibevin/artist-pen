import { mdiTextBox, mdiTextBoxPlus, mdiTextBoxEdit } from "@mdi/js";
import { DiaryFeatureIcon, DisplayMode } from "~/dwdy/feature/def";

export type FeatureMeta = {
  raw: string;
  html: string;
};

export type FeatureStat = {
  count: number;
  fileSize: number;
  words: number;
  letters: number;
};

export type FeatureConfig = {
  display: DisplayMode;
};

export const FEATURE_ICON: DiaryFeatureIcon = {
  main: { set: "mdi", path: mdiTextBox },
  create: { set: "mdi", path: mdiTextBoxPlus },
  edit: { set: "mdi", path: mdiTextBoxEdit },
};

export const DEFAULT_FEATURE_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
  words: 0,
  letters: 0,
};

export const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
  display: "list",
};
