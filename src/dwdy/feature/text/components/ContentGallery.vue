<script setup lang="ts">
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import { DiaryContentFeatureIndex } from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/text/components/ContentSlate.vue";

const props = defineProps({
  enableClick: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "openFullViewer", value: DiaryContentFeatureIndex): void;
}>();

const dwdyState = useDwdyState();

function onGalleryClicked(): void {
  if (props.enableClick) {
    emit("openFullViewer", { feature: DiaryFeature.Text });
  }
}
</script>
<template>
  <button
    class="flex flex-col"
    :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
    @click="onGalleryClicked"
  >
    <div
      v-for="(_text, index) in dwdyState.entry.value.fetchContents(
        DiaryFeature.Text
      )"
      :key="index"
      class="mb-2"
    >
      <div class="mb-2 flex items-center">
        <SvgIcon
          :icon-set="featureIcon(DiaryFeature.Text).set"
          :path="featureIcon(DiaryFeature.Text).path"
          :size="20"
        ></SvgIcon>
        <div
          v-if="dwdyState.entry.value.contentSize(DiaryFeature.Text) > 1"
          class="ml-2 text-sm font-bold"
        >
          {{ index + 1 }}
        </div>
      </div>
      <ContentSlate :content-index="index"> </ContentSlate>
    </div>
  </button>
</template>
