import { LocationQuery } from "vue-router";
import { DiaryLayout, DiaryInsertEntryTarget } from "~/dwdy/layout/def";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry, DiaryEntryParams } from "~/models/dwdy/diaryEntry";
import { LAYOUT_FLOW as TimeLayoutFlow } from "~/dwdy/layout/flow/time";
import { LAYOUT_FLOW as DIndexLayoutFlow } from "~/dwdy/layout/flow/dIndex";
import { DiaryEntryBunch } from "~/dwdy/types/bunch";
// import { LAYOUT_FLOW as GeoLayoutFlow } from "~/dwdy/layout/flow/geo";

export type DiaryLayoutFlow = {
  insertNewEntry: (
    diary: Diary,
    entryParams: DiaryEntryParams,
    target: DiaryInsertEntryTarget
  ) => Promise<DiaryEntry>;
  fetchEntryByRouteQuery: (
    diary: Diary,
    query: LocationQuery
  ) => Promise<DiaryEntry>;
  insertNewEntryByRouteQuery: (
    diary: Diary,
    query: LocationQuery
  ) => Promise<DiaryEntry>;
  fetchBunchByEntry: (
    diary: Diary,
    entry: DiaryEntry,
    bunch?: DiaryEntryBunch
  ) => Promise<DiaryEntryBunch>;
  updateBunchByEntry: (
    bunch: DiaryEntryBunch,
    entry: DiaryEntry
  ) => Promise<DiaryEntryBunch>;
  findPrevEntry: (
    diary: Diary,
    entry: DiaryEntry
  ) => Promise<DiaryEntry | null>;
  findNextEntry: (
    diary: Diary,
    entry: DiaryEntry
  ) => Promise<DiaryEntry | null>;
};

const LAYOUT_FLOW_MAP: Record<DiaryLayout, DiaryLayoutFlow> = {
  [DiaryLayout.Calendar]: TimeLayoutFlow,
  [DiaryLayout.Timeline]: TimeLayoutFlow,
  [DiaryLayout.Notebook]: DIndexLayoutFlow,
};

export function layoutFlow(diary: Diary): DiaryLayoutFlow {
  return LAYOUT_FLOW_MAP[diary.doc.layout];
}
