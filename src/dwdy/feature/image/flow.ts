import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { deleteImage, isKeywordFound, applyKeywordSearch } from "./action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  deleteContent: deleteImage,
  isKeywordFound: isKeywordFound,
  applyKeywordSearch: applyKeywordSearch,
};
