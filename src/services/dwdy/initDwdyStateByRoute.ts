import { RouteLocationNormalizedLoaded } from "vue-router";
import { DIndex } from "~/types/dwdy/core";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { useDwdyState } from "~/states/useDwdyState";
import { layoutFlow } from "~/dwdy/layout/flow";

export async function initDwdyStateByRoute(
  dwdyState: ReturnType<typeof useDwdyState>,
  route: RouteLocationNormalizedLoaded
): Promise<boolean> {
  if (!route.params.uid) {
    return false;
  }
  if (!(await fetchDiaryToState(dwdyState, route))) {
    return false;
  }
  await fetchEntryToState(dwdyState, route);
  await fetchBunchToState(dwdyState);
  return true;
}

async function fetchDiaryToState(
  dwdyState: ReturnType<typeof useDwdyState>,
  route: RouteLocationNormalizedLoaded
): Promise<boolean> {
  if (route.params.uid === dwdyState.diary.value.doc.dUid) {
    return true;
  }
  dwdyState.resetDiaryState();
  const fetchedDiary = await Diary.fetch(route.params.uid as string);
  if (fetchedDiary) {
    dwdyState.diary.value = fetchedDiary;
    return true;
  }
  return false;
}

async function fetchEntryToState(
  dwdyState: ReturnType<typeof useDwdyState>,
  route: RouteLocationNormalizedLoaded
): Promise<void> {
  const queryDIndex = route.query.i as DIndex;
  if (queryDIndex) {
    if (
      dwdyState.entry.value.isStored &&
      dwdyState.entry.value.doc.dUid === dwdyState.diary.value.doc.dUid &&
      dwdyState.entry.value.doc.dIndex === queryDIndex
    ) {
      return;
    }
    const fetchedEntry = await dwdyState.diary.value.fetchEntry({
      dIndex: queryDIndex,
    });
    if (fetchedEntry) {
      dwdyState.entry.value = fetchedEntry;
      return;
    }
  }
  const diary = new Diary(dwdyState.diary.value.doc);
  const flow = layoutFlow(diary);
  dwdyState.entry.value = await flow.fetchEntryByRouteQuery(diary, route.query);
}

async function fetchBunchToState(
  dwdyState: ReturnType<typeof useDwdyState>
): Promise<void> {
  const diary = new Diary(dwdyState.diary.value.doc);
  const entry = new DiaryEntry(dwdyState.entry.value.doc);
  const flow = layoutFlow(diary);
  dwdyState.bunch.value = await flow.fetchBunchByEntry(
    diary,
    entry,
    dwdyState.bunch.value
  );
}

export async function insertEntryByRoute(
  dwdyState: ReturnType<typeof useDwdyState>,
  route: RouteLocationNormalizedLoaded
): Promise<boolean> {
  if (!dwdyState.diary.value.isStored) {
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
