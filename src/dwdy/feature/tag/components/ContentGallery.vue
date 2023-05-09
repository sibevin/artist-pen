<script setup lang="ts">
import { computed } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { DiaryPageActionParams } from "~/types/dwdy/core";
import ContentSlate from "~/dwdy/feature/tag/components/ContentSlate.vue";

const emit = defineEmits<{
  (e: "openSearch", query?: string): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const props = defineProps({
  enableClick: {
    type: Boolean,
    default: true,
  },
});

const dwdyState = useDwdyState();
const searchState = useSearchState();

const currentTags = computed<string[]>(() => {
  return dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
    DiaryFeature.Tag
  );
});

function onTagClicked(tag: string): void {
  if (props.enableClick) {
    searchState.query.value.feature.tag = [tag];
    emit("triggerAction", { action: "apply-search" });
  }
}
</script>
<template>
  <div
    v-if="currentTags.length > 0"
    class="w-full flex flex-wrap justify-center"
  >
    <ContentSlate
      v-for="(tag, index) in currentTags"
      :key="index"
      :content="tag"
      class="mr-2 mb-2"
      :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
      @click="onTagClicked(tag)"
    ></ContentSlate>
  </div>
</template>
