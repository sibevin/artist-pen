import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { addEmptySound, deleteSound } from "~/dwdy/feature/sound/action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  creation: {
    creator: {
      create: async () => {
        await addEmptySound();
      },
    },
  },
  deletion: {
    delete: deleteSound,
  },
};
