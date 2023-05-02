<script setup lang="ts">
import { computed } from "vue";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON } from "~/dwdy/feature/tag/def";
import { DiaryPageActionParams } from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";
import SearchHistoryEntry from "./SearchHistoryEntry.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.feature.tag");
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
  <button @click="onSearchMenuEntryBtnClicked()">
    <div
      v-if="tags.length === 0"
      class="btn btn-primary btn-outline rounded-xl flex items-center flex-nowrap pr-1"
    >
      <SvgIcon
        class="mr-2"
        :icon-set="FEATURE_ICON['main'].set"
        :path="FEATURE_ICON['main'].path"
        :size="24"
      ></SvgIcon>
      <div class="mr-2">
        {{ featureText(DiaryFeature.Tag, la) }}
      </div>
    </div>
    <SearchHistoryEntry
      v-else
      :query="searchState.query.value"
      :enable-hover="true"
    ></SearchHistoryEntry>
  </button>
</template>
