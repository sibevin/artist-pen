<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import {
  mdiClock,
  mdiSortAscending,
  mdiTextSearchVariant,
  mdiTrashCan,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { useSearchState } from "~/states/useSearchState";
import {
  EMPTY_SEARCH_QUERY,
  sortOptionToQuery,
  sortQueryToOptions,
  isQueryEmpty,
} from "~/services/dwdy/search";
import { searchSortOpts } from "~/dwdy/layout/calendar/map";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText, featureIcon } from "~/dwdy/feature/map";
import { featureComponent } from "~/dwdy/feature/component";
import { DiaryPageActionParams } from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const dwdyState = useDwdyState();
const searchState = useSearchState();
const la = new LocaleActor("dwdy.layout.calendar.components.SearchMain");

const keywordOption = computed<string>({
  get() {
    return searchState.query.value.keywords.join(" ");
  },
  set(value: string) {
    searchState.query.value.keywords = value
      .split(" ")
      .filter((word) => word !== "");
  },
});

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

function onQueryInputTyped(): void {
  console.log("query typed", searchState.query.value.keywords);
}

function onSearchSortBtnClicked(): void {
  emit("triggerAction", { action: "open-search-sort-modal" });
}

function onSearchWithTimeRangeBtnClicked(): void {
  emit("triggerAction", { action: "open-search-time-range-modal" });
}

function onSearchWithFeatureBtnClicked(feature: DiaryFeature): void {
  emit("triggerAction", {
    action: "open-search-feature-modal",
    cfi: { feature: feature },
  });
}

function onSearchCombinationBtnClicked(): void {
  console.log("search combination");
  // TODO: Store the current query combination
}

function onSearchClearBtnClicked(): void {
  searchState.query.value = Object.assign({}, EMPTY_SEARCH_QUERY);
}
</script>
<template>
  <div class="h-full inset-0 flex flex-col gap-2">
    <div class="grow">[SearchMain]: Calendar</div>
    <div class="flex-none flex flex-wrap gap-2">
      <button
        class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap"
        @click="onSearchWithTimeRangeBtnClicked"
      >
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiClock"
          :size="24"
        ></SvgIcon>
        {{ la.t(".timeRange") }}
      </button>
      <template
        v-for="(feature, index) in dwdyState.diary.value.enabledFeatures"
        :key="index"
      >
        <button
          v-if="featureComponent(feature, 'searchQuerySelector')"
          class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap"
          @click="onSearchWithFeatureBtnClicked(feature)"
        >
          <SvgIcon
            class="mr-2"
            :icon-set="featureIcon(feature).set"
            :path="featureIcon(feature).path"
            :size="24"
          ></SvgIcon>
          {{ featureText(feature, la) }}
        </button>
      </template>
      <template v-for="opt in searchSortOpts(la)" :key="opt.value">
        <button
          v-if="sortOption === opt.value"
          class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap"
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
      <div class="grow flex justify-end gap-2">
        <button
          class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap"
          @click="onSearchCombinationBtnClicked"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiTextSearchVariant"
            :size="24"
          ></SvgIcon>
          {{ la.t(".searchHistory") }}
        </button>
      </div>
    </div>
    <div class="flex justify-between gap-2">
      <input
        ref="queryInput"
        v-model="keywordOption"
        class="flex-1 input input-bordered border-base-200 w-full"
        :placeholder="(la.t('.queryHint') as string)"
        type="text"
        name="query"
        @input="onQueryInputTyped"
      />
      <button
        v-if="!isQueryEmpty(searchState.query.value)"
        class="flex-none btn btn-error btn-outline rounded-full flex items-center flex-nowrap"
        @click="onSearchClearBtnClicked"
      >
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiTrashCan"
          :size="24"
        ></SvgIcon>
        {{ la.t(".clear") }}
      </button>
    </div>
  </div>
</template>
