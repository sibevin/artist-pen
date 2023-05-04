import { faker } from "@faker-js/faker";
import { randomPick, randomSample } from "../../../support/randomUtils";
import {
  FeatureMeta,
  FeatureStat,
  FeatureConfig,
} from "~/dwdy/feature/sticker/def";
import { stickerCategories, stickerMap } from "~/dwdy/feature/sticker/data";

export function buildContent(): FeatureMeta {
  return randomPick(Object.keys(stickerMap));
}

export function buildStat(): FeatureStat {
  const distribution: FeatureStat["distribution"] = {};
  distribution[randomPick(Object.keys(stickerMap))] = faker.datatype.number();
  return {
    count: faker.datatype.number(),
    fileSize: faker.datatype.number(),
    distribution,
  };
}

export function buildConfig(): FeatureConfig {
  return {
    recentRecords: randomSample(Object.keys(stickerMap)),
    displayIconTarget: randomPick([
      "first",
      ...stickerCategories.map((group) => group.code),
    ]),
  };
}
