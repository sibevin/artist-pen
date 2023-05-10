import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { deleteText, isKeywordFound, applyKeywordSearch } from "./action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  deleteContent: deleteText,
  isKeywordFound: isKeywordFound,
  applyKeywordSearch: applyKeywordSearch,
};
