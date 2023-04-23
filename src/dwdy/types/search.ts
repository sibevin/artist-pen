import { SortOrder } from "~/dwdy/types/core";
import { DiaryFeature } from "~/dwdy/feature/def";

export const SEARCH_SORT_BYS = ["timestamp", "title"] as const;
export type SearchSortBy = typeof SEARCH_SORT_BYS[number];

export type SearchSortQuery = { by: SearchSortBy; order: SortOrder };

export type SearchQuery = {
  keywords: string[];
  feature: Record<DiaryFeature, string[]> | Record<string, never>;
  sorts: SearchSortQuery[];
  timestampRange?: {
    mark: string;
    query: string;
    from?: number;
    to?: number;
  };
};

export type SearchDateRangeQuery = {
  mark: string;
  value: string;
  valid: boolean;
  text?: string;
};

export type SearchQueryOption = { keyword: string; sort: string };
