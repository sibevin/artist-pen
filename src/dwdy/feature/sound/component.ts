import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "~/dwdy/feature/sound/components/EditorMain.vue";
import EditorMenu from "~/dwdy/feature/sound/components/EditorMenu.vue";
import ContentGallery from "~/dwdy/feature/sound/components/ContentGallery.vue";
import ContentSlate from "~/dwdy/feature/sound/components/ContentSlate.vue";
import ContentListEntry from "~/dwdy/feature/sound/components/ContentListEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  editorMenu: EditorMenu,
  gallery: ContentGallery,
  slate: ContentSlate,
  listEntry: ContentListEntry,
};
