import { IconifyIcon } from "@iconify/vue";
import { bxsRdSticker, bxsRdStickerPlus } from "~/services/iconSetPath";
import { DiaryFeatureIcon } from "~/dwdy/feature/def";
import { Icon as IconType } from "~/models/app/types";

export type StickerValue = string;

export type FeatureMeta = StickerValue;

export type FeatureStat = {
  count: number; // total number of assigned stickers
  fileSize: number;
  distribution: Record<StickerValue, number>;
};

export type FeatureConfig = {
  recentRecords: FeatureMeta[];
  displayIconTarget: string; // "first" or sticker category code
};

export interface DiaryStickerIcon {
  set: string;
  path?: string;
  raw?: IconifyIcon;
}

export interface DiarySticker {
  icon: DiaryStickerIcon;
  size?: number;
  bordered?: boolean;
  imagePath?: string;
  color?: string;
}

export interface DiaryStickerGroup {
  code: string;
  icon: IconType;
  stickerCodes: string[];
}

export const FEATURE_ICON: DiaryFeatureIcon = {
  main: { set: "bxs", path: bxsRdSticker },
  create: { set: "bxs", path: bxsRdStickerPlus },
  edit: { set: "bxs", path: bxsRdStickerPlus },
};

export const DEFAULT_FEATURE_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
  distribution: {},
};

export const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
  recentRecords: [],
  displayIconTarget: "first",
};
