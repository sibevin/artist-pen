import { mdiRdImage, mdiRdImagePlus } from "~/services/iconSetPath";
import { DUid } from "~/types/dwdy/core";
import { DiaryFeatureIcon, DisplayMode } from "~/dwdy/feature/def";

export type FeatureMeta = {
  fileSize: number;
  width: number;
  height: number;
  daUid?: DUid;
  fileType?: string;
  fileExt?: string;
  thumbnail?: string;
  comment?: string;
};

export type FeatureStat = {
  count: number;
  fileSize: number;
};

export type FeatureConfig = {
  display: DisplayMode;
  desktopFullViewerW: number;
};

export type ImagePack = FeatureMeta & { dataUrl: string };

export const FEATURE_ICON: DiaryFeatureIcon = {
  main: { set: "mdi", path: mdiRdImage },
  create: { set: "mdi", path: mdiRdImagePlus },
  edit: { set: "mdi", path: mdiRdImagePlus },
};

export const DEFAULT_FEATURE_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
};

export const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
  display: "carousel",
  desktopFullViewerW: 60,
};
