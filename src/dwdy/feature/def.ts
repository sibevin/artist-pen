import { DiaryEntryIdentityParams } from "~/types/dwdy/core";
import { Icon } from "~/models/app/types";

export enum DiaryFeature {
  Text = "text",
  Image = "image",
  Sound = "sound",
  Sticker = "sticker",
  Tag = "tag",
  // Video = "video",
  // Illustration = "illustration",
  // Location = "location",
  // TodoList = "todo_list",
  // DataList = "data_list",
  // File = "file",
}

export const DISPLAY_MODES = ["carousel", "list"] as const;
export type DisplayMode = typeof DISPLAY_MODES[number];

export type DiaryFeatureFlow = {
  deleteContent?: (
    dei: DiaryEntryIdentityParams,
    index: number
  ) => Promise<void>;
};

export type DiaryFeatureIcon = {
  main: Icon;
  create: Icon;
  edit: Icon;
};

export type DiaryFeatureComponent = {
  editorMenu?: any;
  editorMain?: any;
  gallery?: any;
  slate?: any;
  fullViewer?: any;
  listEntry?: any;
  configPanel?: any;
  fullViewerConfigPanel?: any;
  searchQuerySelector?: any;
  searchMenuEntry?: any;
  searchHistoryEntry?: any;
};
