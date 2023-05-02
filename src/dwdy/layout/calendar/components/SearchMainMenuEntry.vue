<script setup lang="ts">
import { computed } from "vue";
import { mdiClock } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { DiaryPageActionParams } from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";
import SearchHistoryEntry from "./SearchHistoryEntry.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.layout.calendar.components.search");
const searchState = useSearchState();

const currentMark = computed<string | undefined>(() => {
  const queryMark = searchState.query.value.timestampRange?.mark;
  if (!queryMark) {
    return undefined;
  }
  if (queryMark !== "customized") {
    return queryMark;
  }
  const rangeQuery = searchState.query.value.timestampRange?.query;
  if (rangeQuery) {
    return rangeQuery.replaceAll("-", ".").replace("_", " - ");
  }
  return undefined;
});

function onSearchMainMenuEntryBtnClicked(): void {
  emit("triggerAction", { action: "open-search-time-range-modal" });
}
</script>
<template>
  <button @click="onSearchMainMenuEntryBtnClicked">
    <div
      v-if="currentMark === undefined"
      class="btn btn-primary btn-outline rounded-xl flex items-center flex-nowrap"
    >
      <SvgIcon
        class="mr-2"
        icon-set="mdi"
        :path="mdiClock"
        :size="24"
      ></SvgIcon>
      {{ la.t(".timeRange") }}
    </div>
    <SearchHistoryEntry
      v-else
      :query="searchState.query.value"
      :enable-hover="true"
    ></SearchHistoryEntry>
  </button>
</template>
