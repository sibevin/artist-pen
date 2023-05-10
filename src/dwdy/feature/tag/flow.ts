import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { isKeywordFound, applyKeywordSearch } from "./action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  isKeywordFound: isKeywordFound,
  applyKeywordSearch: applyKeywordSearch,
};
