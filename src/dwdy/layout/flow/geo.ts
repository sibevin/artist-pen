import { LocationQuery } from "vue-router";
import { DiaryInsertEntryTarget } from "~/dwdy/layout/def";
import { DIndex } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry, DiaryEntryParams } from "~/models/dwdy/diaryEntry";
import { dbDwdy } from "~/services/db/dwdy";
import { AppError } from "~/models/app/error";
import { GeoLocator } from "~/services/geoLocator";
import { GeoCoords, GeoRange } from "~/types/dwdy/core";
import { DiaryEntryBunch, BunchFetchOption } from "~/types/dwdy/bunch";

export const LAYOUT_FLOW = {
  insertNewEntry: insertNewEntryByGeo,
  fetchEntryByRouteQuery: fetchEntryByGeoQuery,
  insertNewEntryByRouteQuery: insertNewEntryByGeoQuery,
  fetchBunchByEntry: fetchBunchByEntryGeo,
};

async function insertNewEntryByGeo(
  diary: Diary,
  entryParams: DiaryEntryParams = {},
  target: DiaryInsertEntryTarget
): Promise<DiaryEntry> {
  if (!diary.doc.dUid) {
    throw new AppError({ code: "diary_not_stored" });
  }
  let coords = {
    longitude: target.longitude,
    latitude: target.latitude,
  };
  if (!coords.longitude || !coords.latitude) {
    coords = await fetchCurrentGeoCoords();
  }
  let entry = await diary.fetchEntry(coords);
  if (entry) {
    return entry;
  }
  const entryDoc = Object.assign({}, entryParams, coords);
  entry = await diary.appendEntry(entryDoc);
  return entry;
}

async function insertNewEntryByGeoQuery(
  diary: Diary,
  query: LocationQuery
): Promise<DiaryEntry> {
  let coords = {
    longitude: Number(query.lng as string),
    latitude: Number(query.lat as string),
  };
  if (!coords.longitude || !coords.latitude) {
    coords = await fetchCurrentGeoCoords();
  }
  return await insertNewEntryByGeo(diary, {}, coords);
}

async function fetchEntryByGeoQuery(
  diary: Diary,
  query: LocationQuery
): Promise<DiaryEntry> {
  let coords = {
    longitude: Number(query.lng as string),
    latitude: Number(query.lat as string),
  };
  let entry: DiaryEntry | null = null;
  if (coords.longitude && coords.latitude) {
    entry = await diary.fetchEntry(coords);
  }
  if (entry === null) {
    coords = await fetchCurrentGeoCoords();
    entry = new DiaryEntry({ dUid: diary.doc.dUid }, coords);
  }
  return entry;
}

async function fetchCurrentGeoCoords(): Promise<GeoCoords> {
  const fetchedCoords = await new GeoLocator().fetch();
  if (fetchedCoords) {
    return {
      longitude: fetchedCoords.longitude,
      latitude: fetchedCoords.latitude,
    };
  } else {
    return { longitude: 0, latitude: 0 };
  }
}

async function fetchBunchByEntryGeo(
  diary: Diary,
  entry: DiaryEntry,
  bunch?: DiaryEntryBunch
): Promise<DiaryEntryBunch> {
  return await fetchBunchByGeo(diary, { entry, bunch });
}

async function fetchBunchByGeo(
  diary: Diary,
  options: BunchFetchOption
): Promise<DiaryEntryBunch> {
  let geoRange = options.geoRange;
  if (!geoRange && options.entry) {
    geoRange = options.entry.geoRange || undefined;
  }
  if (!geoRange) {
    return { dIndexes: [], entryMap: {} };
  }
  if (options.bunch && isInBunchByGeo(options.bunch, geoRange)) {
    return options.bunch;
  }
  const dIndexes: DIndex[] = [];
  const entryMap: Record<DIndex, DiaryEntry> = {};
  await dbDwdy.diaryEntries
    .where(["dUid", "longitude"])
    .between(
      [diary.doc.dUid, geoRange.lngBegin],
      [diary.doc.dUid, geoRange.latEnd],
      true,
      true
    )
    .filter((doc) => {
      if (!doc.latitude || !geoRange) {
        return false;
      }
      return (
        doc.latitude >= geoRange.latBegin && doc.latitude <= geoRange.latEnd
      );
    })
    .each((entryDoc) => {
      dIndexes.push(entryDoc.dIndex);
      entryMap[entryDoc.dIndex] = new DiaryEntry(entryDoc);
    });
  return { dIndexes, entryMap, geoRange };
}

function isInBunchByGeo(bunch: DiaryEntryBunch, geoRange: GeoRange): boolean {
  if (!bunch.geoRange || !geoRange) {
    return false;
  }
  return (
    bunch.geoRange.lngBegin <= geoRange.lngBegin &&
    bunch.geoRange.lngEnd >= geoRange.lngEnd &&
    bunch.geoRange.latBegin <= geoRange.latBegin &&
    bunch.geoRange.latEnd >= geoRange.latEnd
  );
}
