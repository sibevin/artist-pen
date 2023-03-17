import { DiaryLayoutComponent } from "~/dwdy/layout/def";
import ContentMain from "~/dwdy/layout/timeline/components/ContentMain.vue";
import ContentNavMenu from "~/dwdy/layout/timeline/components/ContentNavMenu.vue";
import TitlePanel from "~/dwdy/layout/timeline/components/TitlePanel.vue";
import LastContentPanel from "~/dwdy/layout/timeline/components/LastContentPanel.vue";
import ConfigPanel from "~/dwdy/layout/timeline/components/ConfigPanel.vue";

export const LAYOUT_COMPONENT: DiaryLayoutComponent = {
  contentMain: ContentMain,
  contentNavMenu: ContentNavMenu,
  titlePanel: TitlePanel,
  lastContentPanel: LastContentPanel,
  configPanel: ConfigPanel,
};
