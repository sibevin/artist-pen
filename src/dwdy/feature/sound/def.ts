import {
  mdiMicrophone,
  mdiMusic,
  mdiVolumePlus,
  mdiVolumeSource,
} from "@mdi/js";
import { DUid } from "~/dwdy/types/core";
import { DiaryFeatureIcon } from "~/dwdy/feature/def";
import { Icon } from "~/models/app/types";

export const REPEAT_MODES = ["none", "single", "all"] as const;
export type RepeatMode = typeof REPEAT_MODES[number];

export type SoundFrom = "record" | "file";

export type FeatureMeta = {
  fileSize: number;
  duration: number;
  from?: SoundFrom;
  fileType?: string;
  fileExt?: string;
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
  isShuffleOn: boolean;
  volume: number;
  stereoPan: number;
  isAutoplayOn: boolean;
};

export type SoundSource = {
  meta: FeatureMeta;
  data: Blob;
};

export interface SoundTrack extends SoundSource {
  duration: number;
}

export const FEATURE_ICON: DiaryFeatureIcon = {
  main: { set: "mdi", path: mdiVolumeSource },
  create: { set: "mdi", path: mdiVolumePlus },
  edit: { set: "mdi", path: mdiVolumePlus },
};

export const DEFAULT_FEATURE_STAT: FeatureStat = {
  count: 0,
  fileSize: 0,
  duration: 0,
};

export const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
  repeat: "none",
  isShuffleOn: false,
  volume: 50,
  stereoPan: 0,
  isAutoplayOn: true,
};

export const SOUND_FROM_ICON: Record<SoundFrom, Icon> = {
  record: { set: "mdi", path: mdiMicrophone },
  file: { set: "mdi", path: mdiMusic },
};
