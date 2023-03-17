import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { deleteImage, addEmptyImage } from "~/dwdy/feature/image/action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  creation: {
    creator: {
      create: async () => {
        await addEmptyImage();
      },
    },
  },
  deletion: {
    delete: deleteImage,
  },
};
