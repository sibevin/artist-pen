import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "~/dwdy/feature/sticker/components/EditorMain.vue";
import ContentGallery from "~/dwdy/feature/sticker/components/ContentGallery.vue";
import SearchQuerySelector from "~/dwdy/feature/sticker/components/SearchQuerySelector.vue";
import SearchMenuEntry from "~/dwdy/feature/sticker/components/SearchMenuEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  gallery: ContentGallery,
  searchQuerySelector: SearchQuerySelector,
  searchMenuEntry: SearchMenuEntry,
};
