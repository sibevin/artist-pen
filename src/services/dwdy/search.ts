import {
  SearchQuery,
  SearchSortQuery,
  SearchSortBy,
} from "~/dwdy/types/search";
import { SortOrder } from "~/dwdy/types/core";
import { Diary } from "~/models/dwdy/diary";
import { unshiftEntry } from "~/services/fixedSizeArray";

const MAX_HISTORY_SIZE = 10;

export function buildEmptySearchQuery(): SearchQuery {
  return {
    keywords: [],
    feature: {},
    sorts: [],
  };
}

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
  if (query.timestampRange) {
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

export async function addToSearchHistories(
  type: "recent" | "stored",
  diary: Diary,
  query: SearchQuery
): Promise<void> {
  if (isQueryEmpty(query)) {
    return;
  }
  const foundIndex = findDuplicatedQuery(type, diary, query);
  if (foundIndex >= 0) {
    if (type === "recent") {
      diary.doc.searchHistory.recent.splice(
        0,
        0,
        diary.doc.searchHistory.recent.splice(foundIndex, 1)[0]
      );
    } else if (type === "stored") {
      diary.doc.searchHistory.stored.splice(
        0,
        0,
        diary.doc.searchHistory.stored.splice(foundIndex, 1)[0]
      );
    }
  } else {
    if (type === "recent") {
      diary.doc.searchHistory.recent = unshiftEntry(
        diary.doc.searchHistory.recent,
        JSON.parse(JSON.stringify(query)),
        MAX_HISTORY_SIZE
      );
    } else if (type === "stored") {
      diary.doc.searchHistory.stored = unshiftEntry(
        diary.doc.searchHistory.stored,
        JSON.parse(JSON.stringify(query)),
        MAX_HISTORY_SIZE
      );
    }
  }
  await diary.save();
}

export async function removeFromSearchHistories(
  type: "recent" | "stored",
  diary: Diary,
  index: number
): Promise<void> {
  if (type === "recent") {
    if (index < 0 && index >= diary.doc.searchHistory.recent.length) {
      return;
    }
    diary.doc.searchHistory.recent.splice(index, 1);
  } else if (type === "stored") {
    if (index < 0 && index >= diary.doc.searchHistory.stored.length) {
      return;
    }
    diary.doc.searchHistory.stored.splice(index, 1);
  }
  await diary.save();
}

function findDuplicatedQuery(
  type: "recent" | "stored",
  diary: Diary,
  query: SearchQuery
): number {
  let histories: SearchQuery[] = [];
  if (type === "recent") {
    histories = diary.doc.searchHistory.recent;
  } else if (type === "stored") {
    histories = diary.doc.searchHistory.stored;
  }
  for (let i = 0; i < histories.length; i++) {
    if (isSearchQueryEqual(histories[i], query)) {
      return i;
    }
  }
  return -1;
}

function isSearchQueryEqual(queryA: SearchQuery, queryB: SearchQuery): boolean {
  return JSON.stringify(queryA) === JSON.stringify(queryB);
}
