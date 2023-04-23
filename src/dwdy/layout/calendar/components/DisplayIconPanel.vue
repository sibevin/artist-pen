<script setup lang="ts">
import { PropType } from "vue";
import { DisplayIconFormat } from "~/dwdy/layout/calendar/def";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { getCurrentBreakpoint } from "~/services/breakpoint";

const props = defineProps({
  displayIcons: {
    type: Array as PropType<DisplayIconFormat[]>,
    required: true,
  },
});

function calculateIconSize(di: DisplayIconFormat): number {
  const baseSize = ["xs", "sm", "md", "lg"].includes(getCurrentBreakpoint())
    ? 16
    : 28;
  return baseSize * (di.size || 1);
}
function calculateStickerSizeMultiplier(): number {
  if (["xs", "sm", "md", "lg"].includes(getCurrentBreakpoint())) {
    return 0.45;
  } else {
    return 0.5;
  }
}
</script>
<template>
  <div
    class="mb-1 mr-1 xl:mb-2 xl:mr-2 flex flex-row-reverse justify-end items-end gap-0.5"
  >
    <div v-for="(di, index) in props.displayIcons" :key="index">
      <SvgIcon
        v-if="di.icon"
        :icon-set="di.icon.set"
        :path="di.icon.path"
        :size="calculateIconSize(di)"
      ></SvgIcon>
      <StickerIcon
        v-if="di.stickerCode"
        :code="di.stickerCode"
        :size-multiplier="calculateStickerSizeMultiplier()"
      ></StickerIcon>
    </div>
  </div>
</template>
