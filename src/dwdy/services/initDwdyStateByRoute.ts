import { RouteLocationNormalizedLoaded } from "vue-router";
import { DIndex } from "~/dwdy/types/core";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { useDwdyState } from "~/states/useDwdyState";
import { layoutFlow } from "~/dwdy/layout/flow";

export async function initDwdyStateByRoute(
  dwdyState: ReturnType<typeof useDwdyState>,
  route: RouteLocationNormalizedLoaded
): Promise<boolean> {
  const fetchedDiary = await Diary.fetch(route.params.uid as string);
  if (fetchedDiary) {
    dwdyState.diary.value = fetchedDiary;
  } else {
    return false;
  }
  const flow = layoutFlow(fetchedDiary);
  let entry: DiaryEntry | null = null;
  const queryDIndex = route.query.i as DIndex;
  if (queryDIndex) {
    entry = await fetchedDiary.fetchEntry({ dIndex: queryDIndex });
  }
  if (entry === null) {
    entry = await flow.fetchEntryByRouteQuery(fetchedDiary, route.query);
  }
  dwdyState.entry.value = entry;
  dwdyState.bunch.value = await flow.fetchBunchByEntry(
    fetchedDiary,
    entry,
    dwdyState.bunch.value
  );
  return true;
}

export async function insertEntryByRoute(
  dwdyState: ReturnType<typeof useDwdyState>,
  route: RouteLocationNormalizedLoaded
): Promise<boolean> {
  if (!dwdyState.diary.value) {
    return false;
  }
  if (!dwdyState.entry.value) {
    return false;
  }
  if (dwdyState.entry.value.isStored) {
    return true;
  }
  const diary = new Diary(dwdyState.diary.value.doc);
  const flow = layoutFlow(diary);
  const insertedEntry = await flow.insertNewEntryByRouteQuery(
    diary,
    route.query
  );
  dwdyState.updateEntry(insertedEntry.doc);
  return true;
}
