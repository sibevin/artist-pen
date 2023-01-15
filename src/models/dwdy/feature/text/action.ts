import { mdiTextBox, mdiTextBoxPlus, mdiTextBoxEdit } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { DiaryFeatureDef } from "~/models/dwdy/featureDef";
import ContentEditor from "~/components/dwdy/feature/text/ContentEditor.vue";
import ContentGallery from "~/components/dwdy/feature/text/ContentGallery.vue";
import ContentSlate from "~/components/dwdy/feature/text/ContentSlate.vue";
import ContentFullViewer from "~/components/dwdy/feature/text/ContentFullViewer.vue";
import ContentListEntry from "~/components/dwdy/feature/text/ContentListEntry.vue";

export type FeatureMeta = string;
export type FeatureStat = {
  count: number;
  fileSize: number;
  words: number;
  letters: number;
};

export const FEATURE_DEF: DiaryFeatureDef = {
  flow: {
    creation: {},
    deletion: {},
  },
  icon: {
    main: { set: "mdi", path: mdiTextBox },
    create: { set: "mdi", path: mdiTextBoxPlus },
    edit: { set: "mdi", path: mdiTextBoxEdit },
  },
  component: {
    editor: ContentEditor,
    gallery: ContentGallery,
    slate: ContentSlate,
    fullViewer: ContentFullViewer,
    listEntry: ContentListEntry,
  },
};

export const FEATURE_ACTION: DiaryFeatureAction = {
  create: async () => {
    const dwdyState = useDwdyState();
    dwdyState.entry.value.appendContent<DiaryFeature.Text>(
      dwdyState.editingContent.value.feature,
      ""
    );
    await dwdyState.entry.value.save();
    dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
  },
};
