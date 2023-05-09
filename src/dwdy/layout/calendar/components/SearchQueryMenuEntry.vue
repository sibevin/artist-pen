<script setup lang="ts">
import { useSearchState } from "~/states/useSearchState";
import { DiaryPageActionParams } from "~/types/dwdy/core";
import SearchDisplayPanel from "./SearchDisplayPanel.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const searchState = useSearchState();

function onSearchMainMenuEntryBtnClicked(): void {
  emit("triggerAction", { action: "open-search-time-range-modal" });
}
</script>
<template>
  <button
    class="btn btn-primary btn-outline rounded-lg flex items-center flex-nowrap"
    @click="onSearchMainMenuEntryBtnClicked()"
  >
    <SearchDisplayPanel :query="searchState.query.value"></SearchDisplayPanel>
  </button>
</template>
