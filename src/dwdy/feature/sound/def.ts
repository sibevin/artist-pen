import { mdiMicrophone, mdiMicrophonePlus } from "@mdi/js";
import { DUid } from "~/dwdy/types/core";
import { DiaryFeatureIcon } from "~/dwdy/feature/def";

export const REPEAT_MODES = ["none", "single", "all"] as const;
export type RepeatMode = typeof REPEAT_MODES[number];

export type FeatureMeta = {
  fileSize: number;
  duration: number;
  comment?: string;
  daUid?: DUid;
};

export type FeatureStat = {
  count: number;
  fileSize: number;
  duration: number;
};

export type FeatureConfig = {
  repeat: RepeatMode;
  isPlayingRandomly: boolean;
  volume: number;
  isMuted: boolean;
  stereoPan: number;
};

export type SoundSource = {
  meta: FeatureMeta;
  data: string;
};

export interface SoundTrack extends SoundSource {
  duration: number;
}

export const FEATURE_ICON: DiaryFeatureIcon = {
  main: { set: "mdi", path: mdiMicrophone },
  create: { set: "mdi", path: mdiMicrophonePlus },
  edit: { set: "mdi", path: mdiMicrophonePlus },
};

export const DEFAULT_FEATURE_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
  duration: 0,
};

export const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
  repeat: "none",
  isPlayingRandomly: false,
  volume: 100,
  isMuted: false,
  stereoPan: 0,
};
