import { mdiMicrophone, mdiMicrophonePlus } from "@mdi/js";
import { DiaryFeatureDef } from "~/models/dwdy/featureDef";
import ContentEditor from "~/components/dwdy/feature/blank/ContentEditor.vue";
import ContentGallery from "~/components/dwdy/feature/blank/ContentGallery.vue";
import ContentSlate from "~/components/dwdy/feature/blank/ContentSlate.vue";

export type FeatureMeta = {
  fileName: string;
  fileType: string;
  fileSize: number;
  duration: number;
  comment?: string;
};
export type FeatureStat = {
  count: number;
  fileSize: number;
  duration: number;
};
export const FEATURE_DEF: DiaryFeatureDef = {
  flow: {
    creation: {
      customized: true,
    },
    deletion: {},
  },
  icon: {
    main: { set: "mdi", path: mdiMicrophone },
    create: { set: "mdi", path: mdiMicrophonePlus },
    edit: { set: "mdi", path: mdiMicrophonePlus },
  },
  component: {
    editor: ContentEditor,
    gallery: ContentGallery,
    slate: ContentSlate,
  },
};
