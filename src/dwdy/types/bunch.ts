import { DIndex } from "~/dwdy/types/core";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { GeoRange } from "~/dwdy/types/core";

export type DiaryEntryBunch = {
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
