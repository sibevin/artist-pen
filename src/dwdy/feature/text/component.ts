import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "~/dwdy/feature/text/components/EditorMain.vue";
import EditorMenu from "~/dwdy/feature/text/components/EditorMenu.vue";
import ContentGallery from "~/dwdy/feature/text/components/ContentGallery.vue";
import ContentSlate from "~/dwdy/feature/text/components/ContentSlate.vue";
import ContentFullViewer from "~/dwdy/feature/text/components/ContentFullViewer.vue";
import ContentListEntry from "~/dwdy/feature/text/components/ContentListEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  editorMenu: EditorMenu,
  gallery: ContentGallery,
  slate: ContentSlate,
  fullViewer: ContentFullViewer,
  listEntry: ContentListEntry,
};
