<script setup lang="ts">
import { computed } from "vue";
import { mdiChartBubble, mdiNumeric1CircleOutline } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import SvgIcon from "~/components/SvgIcon.vue";
import { featureIcon } from "~/dwdy/feature/map";
import { DiaryFeature } from "~/dwdy/feature/def";
import { stickerCategories } from "~/dwdy/feature/sticker/data";

const emit = defineEmits<{
  (e: "click"): void;
}>();

const dwdyState = useDwdyState();

const displayIconPath = computed<string>(() => {
  const displayIconTarget = dwdyState.diary.value.fetchFeatureConfig(
    DiaryFeature.Sticker
  ).displayIconTarget;
  if (displayIconTarget === "first") {
    return mdiNumeric1CircleOutline;
  }
  const categoryIconPath = getCategoryIconPath(displayIconTarget);
  if (categoryIconPath) {
    return categoryIconPath;
  } else {
    return mdiChartBubble;
  }
});

function getCategoryIconPath(categoryCode: string): string | null {
  for (let i = 0; i < stickerCategories.length; i++) {
    const category = stickerCategories[i];
    if (category.code === categoryCode) {
      return category.icon.path;
    }
  }
  return null;
}
</script>
<template>
  <button
    v-if="dwdyState.diary.value.enabledFeatures.includes(DiaryFeature.Sticker)"
    class="btn btn-ghost rounded-full flex items-center"
    @click="emit('click')"
  >
    <SvgIcon
      class="mr-2 text-base-content"
      :icon-set="featureIcon(DiaryFeature.Sticker).set"
      :path="featureIcon(DiaryFeature.Sticker).path"
      :size="20"
    ></SvgIcon>
    <SvgIcon
      class="text-primary"
      icon-set="mdi"
      :path="displayIconPath"
      :size="24"
    ></SvgIcon>
  </button>
</template>
