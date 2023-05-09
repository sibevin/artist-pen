import { DIndex } from "~/types/dwdy/core";

export enum DiaryLayout {
  Calendar = "calendar",
  Timeline = "timeline",
  Notebook = "notebook",
}

export type DiaryLayoutComponent = {
  contentMain?: any;
  contentNavMenu?: any;
  titlePanel?: any;
  editorMenu?: any;
  editorMain?: any;
  lastContentPanel?: any;
  configPanel?: any;
  searchQueryMenuEntry?: any;
  searchQuerySelector?: any;
  searchSortMenuEntry?: any;
  searchSortSelector?: any;
  searchResultEntry?: any;
  searchHistoryEntry?: any;
};

export type DiaryInsertEntryTarget = {
  timestamp?: number;
  afterDIndex?: DIndex;
  longitude?: number;
  latitude?: number;
};
