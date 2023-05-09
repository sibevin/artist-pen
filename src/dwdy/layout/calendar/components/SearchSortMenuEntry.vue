<script setup lang="ts">
import { computed } from "vue";
import { useSearchState } from "~/states/useSearchState";
import { LocaleActor } from "~/services/locale";
import { sortOptionToQuery, sortQueryToOptions } from "~/services/dwdy/search";
import { searchSortOpts } from "~/dwdy/layout/calendar/map";
import { DiaryPageActionParams } from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.layout.calendar.components.SearchMain");
const searchState = useSearchState();

const sortOption = computed<string>({
  get() {
    const sortOpt = sortQueryToOptions(searchState.query.value)[0];
    if (sortOpt) {
      return sortOpt;
    } else {
      return "timestamp_desc";
    }
  },
  set(value: string) {
    searchState.query.value.sorts = sortOptionToQuery([value]);
  },
});

function onSearchSortBtnClicked(): void {
  emit("triggerAction", { action: "open-search-sort-modal" });
}
</script>
<template>
  <template v-for="opt in searchSortOpts(la)" :key="opt.value">
    <button
      v-if="sortOption === opt.value"
      class="btn btn-primary btn-outline rounded-lg flex items-center flex-nowrap"
      @click="onSearchSortBtnClicked"
    >
      <SvgIcon
        v-if="opt.icon"
        class="mr-2"
        :icon-set="opt.icon.set"
        :path="opt.icon.path"
        :size="24"
      ></SvgIcon>
      {{ opt.label }}
    </button>
  </template>
</template>
