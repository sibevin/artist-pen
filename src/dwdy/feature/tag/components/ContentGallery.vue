<script setup lang="ts">
import { computed } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { buildTagQuery } from "~/dwdy/feature/tag/action";
import ContentSlate from "~/dwdy/feature/tag/components/ContentSlate.vue";

const emit = defineEmits<{
  (e: "openSearch", query?: string): void;
}>();

const props = defineProps({
  enableClick: {
    type: Boolean,
    default: false,
  },
});

const dwdyState = useDwdyState();

const currentTags = computed<string[]>(() => {
  return dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
    DiaryFeature.Tag
  );
});

function onTagClicked(tag: string): void {
  if (props.enableClick) {
    emit("openSearch", buildTagQuery(tag));
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
