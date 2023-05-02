import { SortOrder } from "~/types/dwdy/core";
import { DiaryFeature } from "~/dwdy/feature/def";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";

export const SEARCH_SORT_BYS = ["timestamp", "title"] as const;
export type SearchSortBy = typeof SEARCH_SORT_BYS[number];

export type SearchSortQuery = { by: SearchSortBy; order: SortOrder };

export const SEARCH_KEYWORD_MODES = ["substring", "regex"] as const;
export type SearchKeywordMode = typeof SEARCH_KEYWORD_MODES[number];

export type SearchKeywordOption = {
  mode: SearchKeywordMode;
  caseSensitive: boolean;
};

export type SearchQuery = {
  keywords: string[];
  keywordOption: SearchKeywordOption;
  feature: Record<DiaryFeature, string[]> | Record<string, never>;
  sorts: SearchSortQuery[];
  timestampRange?: {
    mark: string;
    display: string;
    query: string;
  };
};

export type SearchDateRangeQuery = {
  mark: string;
  display: string;
  value: string;
  valid: boolean;
  text?: string;
};

export type SearchQueryOption = { keyword: string; sort: string };

export type SearchPagination = {
  currentPage: number;
  totalPage: number;
  totalCount: number;
  perPageCount: number;
};

export type SearchKeywordMatch = {
  source: "title" | "feature";
  feature?: DiaryFeature;
  index: number;
  highlight: string;
  match: string;
};

export type SearchResultEntry = {
  entry: DiaryEntry;
  matches: Record<string, SearchKeywordMatch[]>;
};

export type SearchResult = {
  query: SearchQuery;
  results: SearchResultEntry[];
};
