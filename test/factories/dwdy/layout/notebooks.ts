import { faker } from "@faker-js/faker";
import { LayoutConfig } from "~/dwdy/layout/notebook/def";

export function buildConfig(): LayoutConfig {
  return {
    isIndexShown: faker.datatype.boolean(),
  };
}
