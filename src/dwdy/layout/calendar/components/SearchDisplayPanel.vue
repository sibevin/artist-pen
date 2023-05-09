<script setup lang="ts">
import { computed, PropType } from "vue";
import { LocaleActor } from "~/services/locale";
import { SearchQuery } from "~/types/dwdy/search";
import { mdiClock } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  query: {
    type: Object as PropType<SearchQuery>,
    required: true,
  },
});

const la = new LocaleActor("dwdy.layout.calendar.components.search");

const currentDisplay = computed<string | undefined>(() => {
  const queryMark = props.query.timestampRange?.mark;
  if (!queryMark) {
    return undefined;
  }
  if (queryMark !== "customized") {
    return queryMark;
  }
  const rangeQuery = props.query.timestampRange?.query;
  if (rangeQuery) {
    return rangeQuery.replaceAll("-", ".").replace("_", " - ");
  }
  return undefined;
});
</script>
<template>
  <div class="flex justify-start items-center gap-2">
    <SvgIcon
      class="flex-none"
      icon-set="mdi"
      :path="mdiClock"
      :size="24"
    ></SvgIcon>
    <div v-if="currentDisplay" class="text-sm font-bold font-mono">
      {{ currentDisplay }}
    </div>
    <div v-else>
      {{ la.t(".timeRange") }}
    </div>
  </div>
</template>
