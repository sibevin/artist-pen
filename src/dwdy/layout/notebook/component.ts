import { DiaryLayoutComponent } from "~/dwdy/layout/def";
import ContentMain from "~/dwdy/layout/notebook/components/ContentMain.vue";
import ContentNavMenu from "~/dwdy/layout/notebook/components/ContentNavMenu.vue";
import TitlePanel from "~/dwdy/layout/notebook/components/TitlePanel.vue";
import ConfigPanel from "~/dwdy/layout/notebook/components/ConfigPanel.vue";

export const LAYOUT_COMPONENT: DiaryLayoutComponent = {
  contentMain: ContentMain,
  contentNavMenu: ContentNavMenu,
  titlePanel: TitlePanel,
  configPanel: ConfigPanel,
};
