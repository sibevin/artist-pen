<script setup lang="ts">
import { computed } from "vue";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { DiaryPageActionParams } from "~/types/dwdy/core";
import SearchDisplayPanel from "./SearchDisplayPanel.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const searchState = useSearchState();

const tags = computed<string[]>(() => {
  return searchState.query.value.feature["tag"] || [];
});

function onSearchMenuEntryBtnClicked(): void {
  emit("triggerAction", {
    action: "open-search-feature-modal",
    cfi: { feature: DiaryFeature.Tag },
  });
}
</script>
<template>
  <button
    class="btn btn-primary btn-outline rounded-lg py-1 flex items-center h-fit"
    @click="onSearchMenuEntryBtnClicked()"
  >
    <SearchDisplayPanel :tags="tags"></SearchDisplayPanel>
  </button>
</template>
