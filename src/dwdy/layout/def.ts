import { DIndex } from "~/dwdy/types/core";

export enum DiaryLayout {
  Calendar = "calendar",
  Timeline = "timeline",
  Notebook = "notebook",
}

export const DISPLAY_ICONS = ["dot", "sticker", "content"] as const;
export type DisplayIcon = typeof DISPLAY_ICONS[number];

export type DiaryLayoutComponent = {
  contentMain?: any;
  contentNavMenu?: any;
  titlePanel?: any;
  editorMenu?: any;
  editorMain?: any;
  lastContentPanel?: any;
  configPanel?: any;
  searchMainMenuEntry?: any;
  searchMainModal?: any;
  searchSortMenuEntry?: any;
  searchSortModal?: any;
  searchResultEntry?: any;
  searchHistoryEntry?: any;
};

export type DiaryInsertEntryTarget = {
  timestamp?: number;
  afterDIndex?: DIndex;
  longitude?: number;
  latitude?: number;
};
