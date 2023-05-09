<script setup lang="ts">
import { computed, PropType } from "vue";
import { SearchQuery } from "~/types/dwdy/search";
import SearchDisplayPanel from "./SearchDisplayPanel.vue";

const props = defineProps({
  query: {
    type: Object as PropType<SearchQuery>,
    required: true,
  },
});

const tags = computed<string[]>(() => {
  return props.query.feature["tag"] || [];
});
</script>
<template>
  <div
    v-if="tags.length > 0"
    class="btn btn-primary text-primary bg-base-100 hover:text-primary hover:bg-base-100 cursor-default rounded-lg flex items-center h-fit"
  >
    <SearchDisplayPanel :tags="tags"></SearchDisplayPanel>
  </div>
</template>
