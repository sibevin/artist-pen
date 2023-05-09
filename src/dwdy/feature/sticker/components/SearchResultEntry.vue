<script setup lang="ts">
import { computed, PropType } from "vue";
import { DiaryEntry } from "~/models/dwdy/diaryEntry";
import { SearchQuery } from "~/types/dwdy/search";
import { DiaryFeature } from "~/dwdy/feature/def";
import SearchDisplayPanel from "./SearchDisplayPanel.vue";

const props = defineProps({
  entry: {
    type: Object as PropType<DiaryEntry>,
    required: true,
  },
  query: {
    type: Object as PropType<SearchQuery>,
    required: true,
  },
});

const stickers = computed<string[]>(() => {
  return (
    props.entry.fetchContents<DiaryFeature.Sticker>(DiaryFeature.Sticker) || []
  );
});
const highlightStickers = computed<string[]>(() => {
  return props.query.feature["sticker"] || [];
});
</script>
<template>
  <div
    class="px-3 border border-primary text-primary bg-base-100 rounded-lg flex items-center"
  >
    <SearchDisplayPanel
      :stickers="stickers"
      :highlight-stickers="highlightStickers"
      class="w-full"
    ></SearchDisplayPanel>
  </div>
</template>
