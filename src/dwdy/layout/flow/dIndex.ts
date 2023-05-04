import { LocationQuery } from "vue-router";
import union from "lodash-es/union";
import { DiaryInsertEntryTarget } from "~/dwdy/layout/def";
import { DIndex } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry, DiaryEntryParams } from "~/models/dwdy/diaryEntry";
import { dbDwdy } from "~/services/db/dwdy";
import { AppError } from "~/models/app/error";
import { genUid } from "~/services/db";
import { DiaryEntryBunch, BunchFetchOption } from "~/types/dwdy/bunch";

export const LAYOUT_FLOW = {
  fetchOrInsertEntry: fetchOrInsertEntryByDIndex,
  fetchEntryByRouteQuery: fetchEntryByDIndexQuery,
  fetchOrInsertEntryByRouteQuery: fetchOrInsertEntryByDIndexQuery,
  fetchBunchByEntry: fetchBunchByEntryDIndex,
  updateBunchByEntry: updateBunchByEntryDIndex,
  findPrevEntry: findPrevDIndexEntry,
  findNextEntry: findNextDIndexEntry,
};

async function fetchOrInsertEntryByDIndex(
  diary: Diary,
  entryParams: DiaryEntryParams = {},
  target: DiaryInsertEntryTarget
): Promise<DiaryEntry> {
  if (!diary.doc.dUid) {
    throw new AppError({ code: "diary_not_stored" });
  }
  if (!target.afterDIndex) {
    throw new AppError({ code: "after_d_index_required" });
  }
  const newDIndex = genUid();
  const entry = await diary.appendEntry(entryParams);
  const targetEntry = await diary.fetchEntry({ dIndex: target.afterDIndex });
  if (targetEntry && targetEntry.doc.nextDIndex) {
    return await diary.moveEntry(newDIndex, targetEntry.doc.nextDIndex);
  } else {
    return entry;
  }
}

async function fetchOrInsertEntryByDIndexQuery(
  diary: Diary,
  query: LocationQuery
): Promise<DiaryEntry> {
  if (query.ai) {
    return await fetchOrInsertEntryByDIndex(
      diary,
      {},
      { afterDIndex: query.ai as string }
    );
  } else {
    return await diary.appendEntry();
  }
}

async function fetchEntryByDIndexQuery(
  diary: Diary,
  query: LocationQuery
): Promise<DiaryEntry> {
  let entry;
  if (query.i) {
    entry = await diary.fetchEntry({ dIndex: query.i as string });
  } else {
    entry = await diary.lastEntry;
  }
  if (entry === null) {
    entry = new DiaryEntry({ dUid: diary.doc.dUid });
  }
  return entry;
}

async function fetchBunchByEntryDIndex(
  diary: Diary,
  entry: DiaryEntry,
  bunch?: DiaryEntryBunch
): Promise<DiaryEntryBunch> {
  return await fetchBunchByDIndex(diary, { entry, bunch });
}

async function fetchBunchByDIndex(
  diary: Diary,
  options: BunchFetchOption
): Promise<DiaryEntryBunch> {
  if (
    options.bunch &&
    options.entry &&
    isInBunchByDIndex(options.bunch, options.entry)
  ) {
    return options.bunch;
  }
  const dIndexes: DIndex[] = [];
  const entryMap: Record<DIndex, DiaryEntry> = {};
  const linkMap: Record<DIndex, DIndex | undefined> = {};
  let firstDIndex;
  await dbDwdy.diaryEntries.where({ dUid: diary.doc.dUid }).each((entryDoc) => {
    if (entryDoc.prevDIndex) {
      firstDIndex = entryDoc.dIndex;
    }
    linkMap[entryDoc.dIndex] = entryDoc.nextDIndex;
    entryMap[entryDoc.dIndex] = new DiaryEntry(entryDoc);
  });
  while (firstDIndex) {
    dIndexes.push(firstDIndex);
    firstDIndex = linkMap[firstDIndex];
  }
  return { dIndexes, entryMap };
}

function isInBunchByDIndex(bunch: DiaryEntryBunch, entry: DiaryEntry): boolean {
  if (!entry.doc.dIndex) {
    return false;
  }
  return bunch.dIndexes.includes(entry.doc.dIndex);
}

async function updateBunchByEntryDIndex(
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
  return bunch;
}

export async function findPrevDIndexEntry(
  diary: Diary,
  entry: DiaryEntry
): Promise<DiaryEntry | null> {
  if (!entry.doc.dIndex) {
    return null;
  }
  const prevEntry = await entry.prevEntry;
  if (!prevEntry) {
    return null;
  }
  const hasFeatures = union(
    diary.enabledFeatures,
    prevEntry.hasContentFeatures
  );
  if (hasFeatures.length > 0) {
    return prevEntry;
  } else {
    return await findPrevDIndexEntry(diary, prevEntry);
  }
}

export async function findNextDIndexEntry(
  diary: Diary,
  entry: DiaryEntry
): Promise<DiaryEntry | null> {
  if (!entry.doc.dIndex) {
    return null;
  }
  const nextEntry = await entry.nextEntry;
  if (!nextEntry) {
    return null;
  }
  const hasFeatures = union(
    diary.enabledFeatures,
    nextEntry.hasContentFeatures
  );
  if (hasFeatures.length > 0) {
    return nextEntry;
  } else {
    return await findNextDIndexEntry(diary, nextEntry);
  }
}
