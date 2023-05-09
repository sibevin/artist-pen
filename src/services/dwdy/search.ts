import Dexie from "dexie";
import { dbDwdy } from "~/services/db/dwdy";
import {
  SearchQuery,
  SearchSortQuery,
  SearchSortBy,
  SearchResult,
  SearchResultEntry,
  SearchKeywordOption,
} from "~/types/dwdy/search";
import { DUid, SortOrder } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { unshiftEntry } from "~/services/fixedSizeArray";
import { dtToEntryTs, dsToDt, getNeighborDt } from "~/services/dwdy/dateUtils";
import { getRecentRangeDays } from "~/services/recentRange";
import { DiaryEntry, DiaryEntryExistingDoc } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/dwdy/feature/def";

const MAX_HISTORY_SIZE = 10;

export function buildEmptySearchQuery(): SearchQuery {
  return {
    keywords: [],
    keywordOption: {
      mode: "substring",
      caseSensitive: false,
    },
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

export async function applyDiaryEntrySearch(
  dUid: DUid,
  query: SearchQuery
): Promise<SearchResult> {
  const collection = buildSearchCollection(dUid, query);
  console.log("collection", collection);
  collection.filter((entryDoc) => {
    const dEntry = new DiaryEntry(entryDoc);
    console.log("dEntry", dEntry.doc);
    console.log("isKeywordsFound", dEntry.isKeywordsFound(query));
    if (query.keywords.length > 0 && !dEntry.isKeywordsFound(query)) {
      return false;
    }
    if (query.feature["tag"] && query.feature["tag"].length > 0) {
      const tags = dEntry.fetchContents<DiaryFeature.Tag>(DiaryFeature.Tag);
      let found = false;
      for (let i = 0; i < query.feature["tag"].length; i++) {
        const tag = query.feature["tag"][i];
        if (tags.includes(tag)) {
          found = true;
        }
      }
      if (!found) {
        return false;
      }
    }
    if (query.feature["sticker"] && query.feature["sticker"].length > 0) {
      const stickers = dEntry.fetchContents<DiaryFeature.Sticker>(
        DiaryFeature.Sticker
      );
      let found = false;
      for (let i = 0; i < query.feature["sticker"].length; i++) {
        const sticker = query.feature["sticker"][i];
        if (stickers.includes(sticker)) {
          found = true;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  });
  const querySort = query.sorts[0];
  let entries;
  if (querySort) {
    if (querySort.order === "desc") {
      entries = await collection.distinct().reverse().sortBy(querySort.by);
    } else {
      entries = await collection.distinct().sortBy(querySort.by);
    }
  } else {
    entries = await collection.distinct().reverse().sortBy("timestamp");
  }
  console.log("entries:", entries);
  return {
    query,
    entries: buildSearchResultEntries(query, entries),
  };
}

function buildSearchResultEntries(
  query: SearchQuery,
  entries: DiaryEntryExistingDoc[]
): SearchResultEntry[] {
  return entries.map((entryDoc) => {
    const dEntry = new DiaryEntry(entryDoc);
    return {
      entry: dEntry,
      matches: dEntry.getKeywordMatches(query.keywords, query.keywordOption),
    };
  });
}

function buildSearchCollection(
  dUid: DUid,
  query: SearchQuery
): Dexie.Collection<DiaryEntryExistingDoc> {
  const tsRange = query.timestampRange;
  if (!tsRange) {
    return dbDwdy.diaryEntries.where({ dUid });
  }
  let fromTs: number | undefined = undefined;
  let toTs: number | undefined = undefined;
  const recentDays = getRecentRangeDays(tsRange.mark);
  if (recentDays) {
    toTs = dtToEntryTs(new Date());
    fromTs = dtToEntryTs(
      getNeighborDt(new Date(), {
        unit: "day",
        step: recentDays,
        direction: "prev",
      })
    );
  } else {
    const [fromDs, toDs] = tsRange.query.split("_");
    fromTs = fromDs && fromDs !== "" ? dtToEntryTs(dsToDt(fromDs)) : undefined;
    toTs = toDs && toDs !== "" ? dtToEntryTs(dsToDt(toDs)) : undefined;
  }
  if (fromTs && toTs) {
    return dbDwdy.diaryEntries
      .where(["dUid", "timestamp"])
      .between([dUid, fromTs], [dUid, toTs]);
  } else if (fromTs) {
    return dbDwdy.diaryEntries
      .where(["dUid", "timestamp"])
      .between([dUid, fromTs], [dUid, Dexie.maxKey]);
  } else if (toTs) {
    return dbDwdy.diaryEntries
      .where(["dUid", "timestamp"])
      .between([dUid, Dexie.minKey], [dUid, toTs]);
  } else {
    return dbDwdy.diaryEntries.where({ dUid });
  }
}

const HIGHLIGHTED_BORDER_W = 6;

export function findKeywordMatch(
  keyword: string,
  target: string,
  option: SearchKeywordOption,
  withHighlight = true
): {
  index: number;
  match: string;
  highlight: string;
} {
  let index = -1;
  let highlight = target;
  let match = "";
  if (option.mode === "regex") {
    const regex = new RegExp(keyword, `${option.caseSensitive ? "" : "i"}g`);
    index = target.search(regex);
    const regexMatch = regex.exec(target);
    if (regexMatch) {
      match = regexMatch[0];
    }
  } else {
    // substring
    if (option.caseSensitive) {
      index = target.indexOf(keyword);
    } else {
      index = target.toLowerCase().indexOf(keyword.toLowerCase());
    }
    if (index >= 0) {
      match = keyword;
    }
  }
  if (!withHighlight) {
    return { index, match, highlight: "" };
  }
  if (index > HIGHLIGHTED_BORDER_W) {
    highlight = target.slice(
      index - HIGHLIGHTED_BORDER_W,
      match.length + index + HIGHLIGHTED_BORDER_W
    );
    index = HIGHLIGHTED_BORDER_W - 1;
  } else if (index >= 0) {
    highlight = target.slice(0, index + match.length + HIGHLIGHTED_BORDER_W);
  } else {
    highlight = "";
  }
  return { index, match, highlight };
}
