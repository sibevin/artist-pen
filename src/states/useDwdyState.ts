import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { DwdyConfig } from "~/models/dwdy/config";
import { DiaryEntryBunch } from "~/dwdy/types/bunch";
import { Diary } from "~/models/dwdy/diary";
import { DiaryEntry, DiaryEntryDoc } from "~/models/dwdy/diaryEntry";
import { DIndex } from "~/dwdy/types/core";
import { layoutFlow } from "~/dwdy/layout/flow";

export const useDwdyState = createGlobalState(() => {
  const config = ref<DwdyConfig>(new DwdyConfig());
  const diary = ref<Diary>(new Diary());
  const entry = ref<DiaryEntry>(new DiaryEntry());
  const bunch = ref<DiaryEntryBunch>();

  async function fetchEntry(dIndex: DIndex): Promise<void> {
    if (!diary.value || !diary.value.isStored) {
      return;
    }
    const fetchedEntry = await diary.value.fetchEntry({ dIndex });
    if (!fetchedEntry) {
      return;
    }
    await updateEntry(fetchedEntry.doc);
  }

  async function updateEntry(entryDoc: DiaryEntryDoc): Promise<void> {
    const givenEntry = new DiaryEntry(entryDoc);
    entry.value = givenEntry;
    const currentDiary = new Diary(diary.value.doc);
    const flow = layoutFlow(currentDiary);
    if (bunch.value) {
      await flow.updateBunchByEntry(bunch.value, givenEntry);
    }
    await fetchBunch(givenEntry);
  }

  async function fetchBunch(entry: DiaryEntry): Promise<void> {
    const currentDiary = new Diary(diary.value.doc);
    const flow = layoutFlow(currentDiary);
    await flow.fetchBunchByEntry(currentDiary, entry, bunch.value);
  }

  return {
    config,
    diary,
    entry,
    bunch,
    fetchEntry,
    updateEntry,
  };
});
