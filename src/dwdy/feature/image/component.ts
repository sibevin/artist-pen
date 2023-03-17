import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "~/dwdy/feature/image/components/EditorMain.vue";
import EditorMenu from "~/dwdy/feature/image/components/EditorMenu.vue";
import ContentGallery from "~/dwdy/feature/image/components/ContentGallery.vue";
import ContentSlate from "~/dwdy/feature/image/components/ContentSlate.vue";
import ContentFullViewer from "~/dwdy/feature/image/components/ContentFullViewer.vue";
import ContentListEntry from "~/dwdy/feature/image/components/ContentListEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  editorMenu: EditorMenu,
  gallery: ContentGallery,
  slate: ContentSlate,
  fullViewer: ContentFullViewer,
  listEntry: ContentListEntry,
};
