<script setup lang="ts">
import { computed } from "vue";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON } from "~/dwdy/feature/tag/def";
import { DiaryPageActionParams } from "~/dwdy/types/core";
import ContentSlate from "~/dwdy/feature/tag/components/ContentSlate.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.feature.tag");
const searchState = useSearchState();

const tags = computed<string[]>(() => {
  return searchState.query.value.feature["tag"] || [];
});

function onSearchWithTimeRangeBtnClicked(): void {
  emit("triggerAction", {
    action: "open-search-feature-modal",
    cfi: { feature: DiaryFeature.Tag },
  });
}
</script>
<template>
  <button
    class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap pr-1"
    @click="onSearchWithTimeRangeBtnClicked()"
  >
    <SvgIcon
      class="mr-2"
      :icon-set="FEATURE_ICON['main'].set"
      :path="FEATURE_ICON['main'].path"
      :size="24"
    ></SvgIcon>
    <div v-if="tags.length === 0" class="mr-2">
      {{ featureText(DiaryFeature.Tag, la) }}
    </div>
    <ContentSlate
      v-for="(tag, index) in tags"
      :key="index"
      :content="tag"
      class="mr-2 my-1"
    ></ContentSlate>
  </button>
</template>
