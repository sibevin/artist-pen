import { DiaryLayoutComponent } from "~/dwdy/layout/def";
import ContentMain from "~/dwdy/layout/calendar/components/ContentMain.vue";
import ContentNavMenu from "~/dwdy/layout/calendar/components/ContentNavMenu.vue";
import TitlePanel from "~/dwdy/layout/calendar/components/TitlePanel.vue";
import LastContentPanel from "~/dwdy/layout/calendar/components/LastContentPanel.vue";
import ConfigPanel from "~/dwdy/layout/calendar/components/ConfigPanel.vue";
import SearchMain from "~/dwdy/layout/calendar/components/SearchMain.vue";
import SearchMainMenuEntry from "~/dwdy/layout/calendar/components/SearchMainMenuEntry.vue";
import SearchMainModal from "~/dwdy/layout/calendar/components/SearchMainModal.vue";
import SearchSortMenuEntry from "~/dwdy/layout/calendar/components/SearchSortMenuEntry.vue";
import SearchSortModal from "~/dwdy/layout/calendar/components/SearchSortModal.vue";

export const LAYOUT_COMPONENT: DiaryLayoutComponent = {
  contentMain: ContentMain,
  contentNavMenu: ContentNavMenu,
  titlePanel: TitlePanel,
  lastContentPanel: LastContentPanel,
  configPanel: ConfigPanel,
  searchMain: SearchMain,
  searchMainMenuEntry: SearchMainMenuEntry,
  searchMainModal: SearchMainModal,
  searchSortMenuEntry: SearchSortMenuEntry,
  searchSortModal: SearchSortModal,
};
