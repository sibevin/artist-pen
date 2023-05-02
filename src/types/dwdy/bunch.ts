import { DIndex, DUid } from "~/types/dwdy/core";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { GeoRange } from "~/types/dwdy/core";

export type DiaryEntryBunch = {
  dUid?: DUid;
  dIndexes: DIndex[];
  tsRange?: {
    begin: number;
    end: number;
  };
  tsDIndexMap?: Record<number, DIndex>;
  geoRange?: GeoRange;
  entryMap: Record<DIndex, DiaryEntry>;
};

export type BunchFetchOption = {
  entry?: DiaryEntry;
  bunch?: DiaryEntryBunch;
  timestamp?: number;
  geoRange?: GeoRange;
};
