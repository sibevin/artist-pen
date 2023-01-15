import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { DwdyConfig } from "~/models/dwdy/config";
import {
  Diary,
  DIndex,
  DiaryEntryBunch,
  buildEmptyBunch,
} from "~/models/dwdy/diary";
import { DiaryEntry, DiaryEntryDoc } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/models/dwdy/feature";
import { dIndexToDt, isSameDt } from "~/models/dwdy/dateUtils";

export const useDwdyState = createGlobalState(() => {
  const config = ref<DwdyConfig>(new DwdyConfig());
  const diary = ref<Diary>(new Diary());
  const entry = ref<DiaryEntry>(new DiaryEntry());
  const bunch = ref<DiaryEntryBunch>(buildEmptyBunch());
  const editingContent = ref<{
    feature: DiaryFeature;
    index: number;
  }>({
    feature: DiaryFeature.Text,
    index: -1,
  });

  async function fetchEntry(dIndex: DIndex): Promise<void> {
    const dIndexDt = dIndexToDt(dIndex);
    let doBunchFetching = false;
    if (entry.value.doc.dIndex) {
      const oriDIndexDt = dIndexToDt(entry.value.doc.dIndex);
      doBunchFetching = !isSameDt(dIndexDt, oriDIndexDt, "month");
    } else {
      doBunchFetching = true;
    }
    if (diary.value.isStored) {
      entry.value = await diary.value.fetchEntry(dIndex);
      console.log("fetch entry", entry.value);
    } else {
      entry.value = new DiaryEntry({ dIndex }, {});
      console.log("new entry", entry.value);
    }
    if (doBunchFetching) {
      await fetchBunch(dIndex);
    }
  }
  async function fetchBunch(dIndex: DIndex): Promise<void> {
    const dIndexDate = dIndexToDt(dIndex);
    if (diary.value.isStored && dIndexDate) {
      bunch.value = await diary.value.fetchMonthEntries(dIndexDate);
      console.log("fetch bunch", bunch.value);
    } else {
      bunch.value = buildEmptyBunch();
    }
  }
  function updateEntryBunch(entryDoc: DiaryEntryDoc) {
    if (entryDoc.dIndex) {
      const updatedDoc = Object.assign(entryDoc, { isSaved: true });
      entry.value = new DiaryEntry(updatedDoc);
      bunch.value.entryMap[entryDoc.dIndex] = new DiaryEntry(updatedDoc);
      if (!bunch.value.dIndexes.includes(entryDoc.dIndex)) {
        bunch.value.dIndexes.push(entryDoc.dIndex);
      }
    }
  }
  function fetchEditingContent() {
    if (
      editingContent.value.feature &&
      editingContent.value.index !== undefined
    ) {
      return entry.value.fetchContents(editingContent.value.feature)[
        editingContent.value.index
      ];
    } else {
      return undefined;
    }
  }
  return {
    config,
    diary,
    fetchEntry,
    entry,
    bunch,
    fetchBunch,
    updateEntryBunch,
    editingContent,
    fetchEditingContent,
  };
});
