<script setup lang="ts">
import { computed } from "vue";
import { mdiClock } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { DiaryPageActionParams } from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.layout.calendar.components.SearchMain");
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

function onSearchWithTimeRangeBtnClicked(): void {
  emit("triggerAction", { action: "open-search-time-range-modal" });
}
</script>
<template>
  <button
    class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap"
    @click="onSearchWithTimeRangeBtnClicked"
  >
    <SvgIcon class="mr-2" icon-set="mdi" :path="mdiClock" :size="24"></SvgIcon>

    <div
      v-if="currentMark"
      class="mr-1 px-2 py-1 border-2 border-primary rounded text-sm font-bold font-mono"
    >
      {{ currentMark.toUpperCase() }}
    </div>
    <div v-else>
      {{ la.t(".timeRange") }}
    </div>
  </button>
</template>
