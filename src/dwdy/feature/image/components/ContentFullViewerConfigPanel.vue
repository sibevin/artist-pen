<script setup lang="ts">
import { ref, computed } from "vue";
import { mdiArrowExpandHorizontal } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureConfig } from "~/dwdy/feature/image/def";
import SvgIcon from "~/components/SvgIcon.vue";

const dwdyState = useDwdyState();
const featureConfig = ref<FeatureConfig>(
  dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Image)
);

const currentConfig = computed<FeatureConfig>(() => {
  return dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Image);
});

async function onConfigUpdated(): Promise<void> {
  dwdyState.diary.value.patchFeatureConfig(DiaryFeature.Image, {
    desktopFullViewerW: featureConfig.value.desktopFullViewerW,
  });
  await dwdyState.diary.value.save();
}
</script>
<template>
  <div
    v-if="currentConfig.display === 'list'"
    class="hidden md:flex justify-center items-center"
  >
    <SvgIcon
      icon-set="mdi"
      class="mr-2"
      :path="mdiArrowExpandHorizontal"
      :size="24"
    ></SvgIcon>
    <input
      v-model="featureConfig.desktopFullViewerW"
      type="range"
      min="20"
      max="100"
      step="1"
      class="range range-sm max-w-sm"
      @input="onConfigUpdated"
    />
  </div>
</template>
