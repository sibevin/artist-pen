import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { deleteSound, isKeywordFound, applyKeywordSearch } from "./action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  deleteContent: deleteSound,
  isKeywordFound: isKeywordFound,
  applyKeywordSearch: applyKeywordSearch,
};
