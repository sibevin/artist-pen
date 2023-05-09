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

const stickers = computed<string[]>(() => {
  return searchState.query.value.feature["sticker"] || [];
});

function onSearchMenuEntryBtnClicked(): void {
  emit("triggerAction", {
    action: "open-search-feature-modal",
    cfi: { feature: DiaryFeature.Sticker },
  });
}
</script>
<template>
  <button
    class="btn btn-primary btn-outline rounded-lg flex items-center h-fit"
    @click="onSearchMenuEntryBtnClicked()"
  >
    <SearchDisplayPanel :stickers="stickers"></SearchDisplayPanel>
  </button>
</template>
