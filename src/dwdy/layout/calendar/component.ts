import { DiaryLayoutComponent } from "~/dwdy/layout/def";
import ContentMain from "~/dwdy/layout/calendar/components/ContentMain.vue";
import ContentNavMenu from "~/dwdy/layout/calendar/components/ContentNavMenu.vue";
import TitlePanel from "~/dwdy/layout/calendar/components/TitlePanel.vue";
import LastContentPanel from "~/dwdy/layout/calendar/components/LastContentPanel.vue";
import ConfigPanel from "~/dwdy/layout/calendar/components/ConfigPanel.vue";

export const LAYOUT_COMPONENT: DiaryLayoutComponent = {
  contentMain: ContentMain,
  contentNavMenu: ContentNavMenu,
  titlePanel: TitlePanel,
  lastContentPanel: LastContentPanel,
  configPanel: ConfigPanel,
};
