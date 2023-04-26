import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "./components/EditorMain.vue";
import EditorMenu from "./components/EditorMenu.vue";
import ContentGallery from "./components/ContentGallery.vue";
import ContentSlate from "./components/ContentSlate.vue";
import ContentListEntry from "./components/ContentListEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  editorMenu: EditorMenu,
  gallery: ContentGallery,
  slate: ContentSlate,
  listEntry: ContentListEntry,
};
