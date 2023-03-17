import { faker } from "@faker-js/faker";
import { randomPick } from "../../../support/randomUtils";
import { DISPLAY_MODES } from "~/dwdy/feature/def";
import {
  FeatureMeta,
  FeatureStat,
  FeatureConfig,
} from "~/dwdy/feature/image/def";

export function buildContent(): FeatureMeta {
  return {
    fileSize: faker.datatype.number(),
    width: faker.datatype.number(),
    height: faker.datatype.number(),
  };
}

export function buildStat(): FeatureStat {
  return {
    count: faker.datatype.number(),
    fileSize: faker.datatype.number(),
  };
}

export function buildConfig(): FeatureConfig {
  return {
    display: randomPick([...DISPLAY_MODES]),
  };
}
