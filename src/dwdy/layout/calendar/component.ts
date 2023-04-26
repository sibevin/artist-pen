import { DiaryLayoutComponent } from "~/dwdy/layout/def";
import ContentMain from "./components/ContentMain.vue";
import ContentNavMenu from "./components/ContentNavMenu.vue";
import TitlePanel from "./components/TitlePanel.vue";
import LastContentPanel from "./components/LastContentPanel.vue";
import ConfigPanel from "./components/ConfigPanel.vue";
import SearchMainMenuEntry from "./components/SearchMainMenuEntry.vue";
import SearchMainModal from "./components/SearchMainModal.vue";
import SearchSortMenuEntry from "./components/SearchSortMenuEntry.vue";
import SearchSortModal from "./components/SearchSortModal.vue";
import SearchHistoryEntry from "./components/SearchHistoryEntry.vue";

export const LAYOUT_COMPONENT: DiaryLayoutComponent = {
  contentMain: ContentMain,
  contentNavMenu: ContentNavMenu,
  titlePanel: TitlePanel,
  lastContentPanel: LastContentPanel,
  configPanel: ConfigPanel,
  searchMainMenuEntry: SearchMainMenuEntry,
  searchMainModal: SearchMainModal,
  searchSortMenuEntry: SearchSortMenuEntry,
  searchSortModal: SearchSortModal,
  searchHistoryEntry: SearchHistoryEntry,
};
