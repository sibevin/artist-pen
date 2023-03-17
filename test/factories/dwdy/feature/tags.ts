import { faker } from "@faker-js/faker";
import { genRandomSize } from "../../../support/randomUtils";
import {
  FeatureMeta,
  FeatureStat,
  FeatureConfig,
} from "~/dwdy/feature/tag/def";

export function buildContent(): FeatureMeta {
  return faker.datatype.string();
}

export function buildStat(): FeatureStat {
  const distribution: FeatureStat["distribution"] = {};
  distribution[faker.datatype.string()] = faker.datatype.number();
  return {
    count: faker.datatype.number(),
    fileSize: faker.datatype.number(),
    distribution,
  };
}

export function buildConfig(): FeatureConfig {
  return {
    recentRecords: genRandomSize(() => {
      return faker.datatype.string();
    }),
  };
}
