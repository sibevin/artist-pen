import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "./components/EditorMain.vue";
import ContentGallery from "./components/ContentGallery.vue";
import ContentSlate from "./components/ContentSlate.vue";
import SearchQuerySelector from "./components/SearchQuerySelector.vue";
import SearchMenuEntry from "./components/SearchMenuEntry.vue";
import SearchHistoryEntry from "./components/SearchHistoryEntry.vue";
import SearchResultEntry from "./components/SearchResultEntry.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  gallery: ContentGallery,
  slate: ContentSlate,
  searchQuerySelector: SearchQuerySelector,
  searchMenuEntry: SearchMenuEntry,
  searchHistoryEntry: SearchHistoryEntry,
  searchResultEntry: SearchResultEntry,
};
