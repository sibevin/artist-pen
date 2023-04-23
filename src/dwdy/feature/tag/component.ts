import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "~/dwdy/feature/tag/components/EditorMain.vue";
import ContentGallery from "~/dwdy/feature/tag/components/ContentGallery.vue";
import ContentSlate from "~/dwdy/feature/tag/components/ContentSlate.vue";
import SearchQuerySelector from "~/dwdy/feature/tag/components/SearchQuerySelector.vue";
import SearchMenuEntry from "~/dwdy/feature/tag/components/SearchMenuEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  gallery: ContentGallery,
  slate: ContentSlate,
  searchQuerySelector: SearchQuerySelector,
  searchMenuEntry: SearchMenuEntry,
};
