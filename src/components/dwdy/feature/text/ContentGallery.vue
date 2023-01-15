<script setup lang="ts">
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { featureIcon } from "~/models/dwdy/featureDef";
import ContentSlate from "~/components/dwdy/feature/text/ContentSlate.vue";

const props = defineProps({
  enableClick: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "openFullViewer"): void;
}>();

const dwdyState = useDwdyState();

function onGalleryClicked(): void {
  if (props.enableClick) {
    emit("openFullViewer");
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
      v-for="(text, index) in dwdyState.entry.value.fetchContents(
        DiaryFeature.Text
      )"
      :key="index"
      class="mb-2 flex"
    >
      <div class="pl-1 pr-2 pb-3 flex flex-col items-center">
        <SvgIcon
          :icon-set="featureIcon(DiaryFeature.Text).set"
          :path="featureIcon(DiaryFeature.Text).path"
          :size="20"
        ></SvgIcon>
        <div
          v-if="dwdyState.entry.value.contentSize(DiaryFeature.Text) > 1"
          class="text-sm font-bold"
        >
          {{ index + 1 }}
        </div>
      </div>
      <ContentSlate :content-index="index"> </ContentSlate>
    </div>
  </button>
</template>
