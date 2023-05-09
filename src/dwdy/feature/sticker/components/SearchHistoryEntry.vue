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

const stickers = computed<string[]>(() => {
  return props.query.feature["sticker"] || [];
});
</script>
<template>
  <div
    v-if="stickers.length > 0"
    class="btn btn-primary text-primary bg-base-100 hover:text-primary hover:bg-base-100 cursor-default rounded-lg flex items-center h-fit"
  >
    <SearchDisplayPanel :stickers="stickers"></SearchDisplayPanel>
  </div>
</template>
