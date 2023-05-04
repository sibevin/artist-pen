import { DiaryFeatureComponent } from "~/dwdy/feature/def";
import EditorMain from "./components/EditorMain.vue";
import ContentGallery from "./components/ContentGallery.vue";
import SearchQuerySelector from "./components/SearchQuerySelector.vue";
import SearchMenuEntry from "./components/SearchMenuEntry.vue";
import SearchHistoryEntry from "./components/SearchHistoryEntry.vue";
import ConfigPanel from "./components/ConfigPanel.vue";

export const FEATURE_COMPONENT: DiaryFeatureComponent = {
  editorMain: EditorMain,
  gallery: ContentGallery,
  searchQuerySelector: SearchQuerySelector,
  searchMenuEntry: SearchMenuEntry,
  searchHistoryEntry: SearchHistoryEntry,
  configPanel: ConfigPanel,
};
