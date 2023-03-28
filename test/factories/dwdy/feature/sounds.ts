import { faker } from "@faker-js/faker";
import { randomPick } from "../../../support/randomUtils";
import {
  FeatureMeta,
  FeatureStat,
  FeatureConfig,
  REPEAT_MODES,
} from "~/dwdy/feature/sound/def";

export function buildContent(): FeatureMeta {
  return {
    fileSize: faker.datatype.number(),
    duration: faker.datatype.number(),
  };
}

export function buildStat(): FeatureStat {
  return {
    count: faker.datatype.number(),
    fileSize: faker.datatype.number(),
    duration: faker.datatype.number(),
  };
}

export function buildConfig(): FeatureConfig {
  return {
    repeat: randomPick([...REPEAT_MODES]),
    isShuffleOn: faker.datatype.boolean(),
    volume: faker.datatype.number({ min: 0, max: 100 }),
    isMuted: faker.datatype.boolean(),
    stereoPan: faker.datatype.number({ min: -50, max: 50 }),
  };
}
