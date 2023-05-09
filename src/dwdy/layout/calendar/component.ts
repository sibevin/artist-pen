import { DiaryLayoutComponent } from "~/dwdy/layout/def";
import ContentMain from "./components/ContentMain.vue";
import ContentNavMenu from "./components/ContentNavMenu.vue";
import TitlePanel from "./components/TitlePanel.vue";
import LastContentPanel from "./components/LastContentPanel.vue";
import ConfigPanel from "./components/ConfigPanel.vue";
import SearchQueryMenuEntry from "./components/SearchQueryMenuEntry.vue";
import SearchQuerySelector from "./components/SearchQuerySelector.vue";
import SearchSortMenuEntry from "./components/SearchSortMenuEntry.vue";
import SearchSortSelector from "./components/SearchSortSelector.vue";
import SearchHistoryEntry from "./components/SearchHistoryEntry.vue";

export const LAYOUT_COMPONENT: DiaryLayoutComponent = {
  contentMain: ContentMain,
  contentNavMenu: ContentNavMenu,
  titlePanel: TitlePanel,
  lastContentPanel: LastContentPanel,
  configPanel: ConfigPanel,
  searchQueryMenuEntry: SearchQueryMenuEntry,
  searchQuerySelector: SearchQuerySelector,
  searchSortMenuEntry: SearchSortMenuEntry,
  searchSortSelector: SearchSortSelector,
  searchHistoryEntry: SearchHistoryEntry,
};
