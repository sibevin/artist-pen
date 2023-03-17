import { faker } from "@faker-js/faker";
import { randomPick } from "../../../support/randomUtils";
import { DISPLAY_MODES } from "~/dwdy/feature/def";
import {
  FeatureMeta,
  FeatureStat,
  FeatureConfig,
} from "~/dwdy/feature/text/def";

export function buildContent(): FeatureMeta {
  return { raw: faker.lorem.sentence(), html: faker.lorem.sentence() };
}

export function buildStat(): FeatureStat {
  return {
    count: faker.datatype.number(),
    fileSize: faker.datatype.number(),
    words: faker.datatype.number(),
    letters: faker.datatype.number(),
  };
}

export function buildConfig(): FeatureConfig {
  return {
    display: randomPick([...DISPLAY_MODES]),
  };
}
