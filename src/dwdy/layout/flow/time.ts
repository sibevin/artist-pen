import { LocationQuery } from "vue-router";
import union from "lodash-es/union";
import { DiaryInsertEntryTarget } from "~/dwdy/layout/def";
import { DUid, DIndex } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry, DiaryEntryParams } from "~/models/dwdy/diaryEntry";
import { dbDwdy } from "~/services/db/dwdy";
import { AppError } from "~/models/app/error";
import { dtToEntryTs, getNeighborTs } from "~/services/dwdy/dateUtils";
import { DiaryEntryBunch, BunchFetchOption } from "~/types/dwdy/bunch";

export const LAYOUT_FLOW = {
  insertNewEntry: insertNewEntryByTimestamp,
  fetchEntryByRouteQuery: fetchEntryByTimestampQuery,
  insertNewEntryByRouteQuery: insertNewEntryByTimestampQuery,
  fetchBunchByEntry: fetchBunchByEntryTimestamp,
  updateBunchByEntry: updateBunchByEntryTimestamp,
  findPrevEntry: findPrevTsEntry,
  findNextEntry: findNextTsEntry,
};

async function insertNewEntryByTimestamp(
  diary: Diary,
  entryParams: DiaryEntryParams = {},
  target: DiaryInsertEntryTarget
): Promise<DiaryEntry> {
  if (!diary.doc.dUid) {
    throw new AppError({ code: "diary_not_stored" });
  }
  if (!target.timestamp) {
    throw new AppError({ code: "timestamp_required" });
  }
  let entry = await diary.fetchEntry(target);
  if (entry) {
    return entry;
  }
  const entryDoc = Object.assign({}, entryParams, {
    timestamp: target.timestamp,
  });
  entry = await diary.appendEntry(entryDoc);
  const nextEntry = await fetchNextEntryByTimestamp(
    diary.doc.dUid,
    target.timestamp
  );
  if (nextEntry && nextEntry.isStored && entry.doc.dIndex) {
    return await diary.moveEntry(entry.doc.dIndex, nextEntry.doc.dIndex);
  } else {
    return entry;
  }
}

async function insertNewEntryByTimestampQuery(
  diary: Diary,
  query: LocationQuery
): Promise<DiaryEntry> {
  const timestamp = getOrInitTsFromRoute(query);
  return await insertNewEntryByTimestamp(diary, {}, { timestamp });
}

async function fetchEntryByTimestampQuery(
  diary: Diary,
  query: LocationQuery
): Promise<DiaryEntry> {
  const timestamp = getOrInitTsFromRoute(query);
  let entry = await diary.fetchEntry({ timestamp });
  if (!entry) {
    entry = new DiaryEntry({ dUid: diary.doc.dUid }, { timestamp });
  }
  return entry;
}

function getOrInitTsFromRoute(query: LocationQuery): number {
  if (query.ts) {
    return Number(query.ts as string);
  } else {
    return dtToEntryTs(new Date());
  }
}

async function fetchNextEntryByTimestamp(
  dUid: DUid,
  timestamp: number
): Promise<DiaryEntry> {
  const entryDoc = await dbDwdy.diaryEntries
    .where(["dUid", "timestamp"])
    .above([dUid, timestamp])
    .first();
  if (entryDoc) {
    return new DiaryEntry(Object.assign(entryDoc));
  } else {
    return new DiaryEntry({ dUid });
  }
}

async function fetchBunchByEntryTimestamp(
  diary: Diary,
  entry: DiaryEntry,
  bunch?: DiaryEntryBunch
): Promise<DiaryEntryBunch> {
  return await fetchBunchByTimestamp(diary, { entry, bunch });
}

async function fetchBunchByTimestamp(
  diary: Diary,
  options: BunchFetchOption
): Promise<DiaryEntryBunch> {
  let timestamp = options.timestamp;
  if (!timestamp && options.entry) {
    timestamp = options.entry.doc.timestamp || undefined;
  }
  if (!timestamp || !diary.doc.dUid) {
    return { dUid: diary.doc.dUid, dIndexes: [], entryMap: {} };
  }
  if (
    options.bunch &&
    !isBunchRefetchRequired(options.bunch, timestamp, diary.doc.dUid)
  ) {
    return options.bunch;
  }
  const dIndexes: DIndex[] = [];
  const entryMap: Record<DIndex, DiaryEntry> = {};
  const tsDIndexMap: Record<number, DIndex> = {};
  const fromTs = getNeighborTs(timestamp, {
    direction: "prev",
    unit: "month",
    alignment: "begin",
  });
  const toTs = getNeighborTs(timestamp, {
    direction: "next",
    unit: "month",
    alignment: "end",
  });
  const beginTs = getNeighborTs(timestamp, {
    direction: "current",
    unit: "month",
    alignment: "begin",
  });
  const endTs = getNeighborTs(timestamp, {
    direction: "current",
    unit: "month",
    alignment: "end",
  });
  const entries = await dbDwdy.diaryEntries
    .where(["dUid", "timestamp"])
    .between([diary.doc.dUid, fromTs], [diary.doc.dUid, toTs], true, true)
    .sortBy("timestamp");
  entries.forEach((entryDoc) => {
    dIndexes.push(entryDoc.dIndex);
    entryMap[entryDoc.dIndex] = new DiaryEntry(entryDoc);
    if (entryDoc.timestamp) {
      tsDIndexMap[entryDoc.timestamp] = entryDoc.dIndex;
    }
  });
  return {
    dUid: diary.doc.dUid,
    dIndexes,
    entryMap,
    tsRange: {
      begin: beginTs,
      end: endTs,
    },
    tsDIndexMap,
  };
}

function isBunchRefetchRequired(
  bunch: DiaryEntryBunch,
  timestamp: number,
  dUid: DUid
): boolean {
  if (!bunch.tsRange) {
    return true;
  }
  if (dUid != bunch.dUid) {
    return true;
  }
  return bunch.tsRange.begin > timestamp || bunch.tsRange.end < timestamp;
}

async function updateBunchByEntryTimestamp(
  bunch: DiaryEntryBunch,
  entry: DiaryEntry
): Promise<DiaryEntryBunch> {
  if (!entry.doc.dIndex) {
    return bunch;
  }
  bunch.entryMap[entry.doc.dIndex] = entry;
  if (!bunch.dIndexes.includes(entry.doc.dIndex)) {
    bunch.dIndexes.push(entry.doc.dIndex);
  }
  if (!entry.doc.timestamp) {
    return bunch;
  }
  if (bunch.tsDIndexMap) {
    bunch.tsDIndexMap[entry.doc.timestamp] = entry.doc.dIndex;
  }
  return bunch;
}

export async function findPrevTsEntry(
  diary: Diary,
  entry: DiaryEntry
): Promise<DiaryEntry | null> {
  if (!entry.doc.timestamp) {
    return null;
  }
  let prevEntry: DiaryEntry;
  if (entry.isStored) {
    const fetchedprevEntry = await entry.prevEntry;
    if (!fetchedprevEntry) {
      return null;
    }
    prevEntry = fetchedprevEntry;
  } else {
    const fetchedEntryDoc = await dbDwdy.diaryEntries
      .where(["dUid", "timestamp"])
      .above([diary.doc.dUid, entry.doc.timestamp])
      .first();
    if (!fetchedEntryDoc) {
      return null;
    }
    prevEntry = new DiaryEntry(fetchedEntryDoc);
  }
  const hasFeatures = union(
    diary.enabledFeatures,
    prevEntry.hasContentFeatures
  );
  if (hasFeatures.length > 0) {
    return prevEntry;
  } else {
    return await findPrevTsEntry(diary, prevEntry);
  }
}

export async function findNextTsEntry(
  diary: Diary,
  entry: DiaryEntry
): Promise<DiaryEntry | null> {
  if (!entry.doc.timestamp) {
    return null;
  }
  let nextEntry: DiaryEntry;
  if (entry.isStored) {
    const fetchedNextEntry = await entry.nextEntry;
    if (!fetchedNextEntry) {
      return null;
    }
    nextEntry = fetchedNextEntry;
  } else {
    const fetchedEntryDoc = await dbDwdy.diaryEntries
      .where(["dUid", "timestamp"])
      .below([diary.doc.dUid, entry.doc.timestamp])
      .first();
    if (!fetchedEntryDoc) {
      return null;
    }
    nextEntry = new DiaryEntry(fetchedEntryDoc);
  }
  const hasFeatures = union(
    diary.enabledFeatures,
    nextEntry.hasContentFeatures
  );
  if (hasFeatures.length > 0) {
    return nextEntry;
  } else {
    return await findNextTsEntry(diary, nextEntry);
  }
}
