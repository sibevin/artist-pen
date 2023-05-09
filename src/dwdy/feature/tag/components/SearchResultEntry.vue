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

const tags = computed<string[]>(() => {
  return props.entry.fetchContents<DiaryFeature.Tag>(DiaryFeature.Tag) || [];
});
const highlightTags = computed<string[]>(() => {
  return props.query.feature["tag"] || [];
});
</script>
<template>
  <div
    class="px-3 py-1 border border-primary text-primary bg-base-100 rounded-lg flex items-center"
  >
    <SearchDisplayPanel
      :tags="tags"
      :highlight-tags="highlightTags"
      class="w-full"
    ></SearchDisplayPanel>
  </div>
</template>
