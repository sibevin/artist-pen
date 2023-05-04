import { DiaryFeature } from "~/dwdy/feature/def";

export type DUid = string;
export type DIndex = string;

export type DiaryEntryIdentity = {
  dUid: DUid;
  dIndex: DIndex;
};
export type DiaryEntryIdentityParams = Partial<DiaryEntryIdentity>;

export type DiaryContentFeatureIndex = {
  feature: DiaryFeature;
  index?: number;
};

export type MoveDirection = "prev" | "next" | "current";
export type MoveAlignment = "none" | "begin" | "end";
export type MoveDateUnit = "month" | "day";
export type MoveEntryUnit = MoveDateUnit | "page";

export type GeoCoords = {
  longitude: number;
  latitude: number;
};
export type GeoRange = {
  lngBegin: number;
  lngEnd: number;
  latBegin: number;
  latEnd: number;
};

export const WEEK_DAYS = [...Array(7).keys()] as const;
export type WeekDay = typeof WEEK_DAYS[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = typeof SORT_ORDERS[number];

export type DiaryPageMovement =
  | "select"
  | "nextDate"
  | "prevDate"
  | "nextPage"
  | "prevPage";

export type DiaryPageAction =
  | "select-date"
  | "select-feature-editor"
  | "open-feature-editor"
  | "open-full-viewer";

export type DiaryEntryMovementParams = {
  direction: MoveDirection;
  unit?: MoveEntryUnit;
  dIndex?: DIndex;
  timestamp?: number;
};

export type DiaryPageActionParams = {
  action:
    | "select-date"
    | "select-feature-editor"
    | "open-feature-editor"
    | "open-full-viewer"
    | "open-display-icon-selector"
    | "open-search-main-modal"
    | "open-search-history-modal"
    | "open-search-time-range-modal"
    | "open-search-feature-modal"
    | "open-search-sort-modal"
    | "apply-search";
  cfi?: DiaryContentFeatureIndex;
  timestamp?: number;
  afterDIndex?: DIndex;
  dIndex?: DIndex;
};