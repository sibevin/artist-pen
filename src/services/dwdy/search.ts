import {
  SearchQuery,
  SearchSortQuery,
  SearchSortBy,
} from "~/dwdy/types/search";
import { SortOrder } from "~/dwdy/types/core";

export const EMPTY_SEARCH_QUERY: SearchQuery = {
  keywords: [],
  feature: {},
  sorts: [],
};

export function sortQueryToOptions(query: SearchQuery): string[] {
  return query.sorts.map((querySort) => {
    return `${querySort.by}_${querySort.order}`;
  });
}

export function sortOptionToQuery(sortOptions: string[]): SearchSortQuery[] {
  return sortOptions.map((sortOpt) => {
    const [by, order] = sortOpt.split("_");
    return { by: by as SearchSortBy, order: order as SortOrder };
  });
}

export function isQueryEmpty(query: SearchQuery): boolean {
  if (!query) {
    return true;
  }
  if (query.keywords && query.keywords.length > 0) {
    return false;
  }
  const featureValues = Object.values(query.feature);
  for (const values of featureValues) {
    if (values && values.length > 0) {
      return false;
    }
  }
  return true;
}
