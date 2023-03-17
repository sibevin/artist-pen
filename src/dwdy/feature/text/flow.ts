import { DiaryFeatureFlow } from "~/dwdy/feature/def";
import { addText, deleteText } from "~/dwdy/feature/text/action";

export const FEATURE_FLOW: DiaryFeatureFlow = {
  creation: {
    creator: {
      create: async () => {
        await addText({ raw: "", html: "" });
      },
    },
  },
  deletion: {
    delete: deleteText,
  },
};
