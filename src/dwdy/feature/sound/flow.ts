import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { deleteSound } from "~/dwdy/feature/sound/action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  creation: {
    customized: true,
  },
  deletion: {
    delete: deleteSound,
  },
};
