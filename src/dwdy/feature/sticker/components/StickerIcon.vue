<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { DiarySticker } from "~/dwdy/feature/sticker/def";
import { stickerMap } from "~/dwdy/feature/sticker/data";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  sizeMultiplier: {
    type: Number,
    default: 1,
  },
});

const ICON_SIZE = 40;

const sticker = computed<DiarySticker | undefined>(() => {
  return stickerMap[props.code] as DiarySticker;
});

const stickerStyle = computed(() => {
  if (!sticker.value) {
    return {};
  }
  const color = sticker.value.color;
  if (color) {
    if (sticker.value.bordered === false) {
      return { color };
    } else {
      return { color, border: `1px solid ${color}` };
    }
  } else {
    return {};
  }
});

const stickerClass = computed(() => {
  if (!sticker.value) {
    return "";
  }
  if (sticker.value.color) {
    return "";
  }
  if (sticker.value.bordered) {
    return "text-primary border border-primary";
  } else {
    return "text-primary";
  }
});

const iconSize = computed(() => {
  if (sticker.value?.size) {
    return sticker.value.size * props.sizeMultiplier;
  }
  return ICON_SIZE * props.sizeMultiplier;
});
</script>

<template>
  <div
    v-if="sticker"
    class="bg-base-100 rounded-full shadow-sm flex justify-center items-center"
    :class="stickerClass"
    :style="stickerStyle"
  >
    <div class="mask mask-circle flex justify-center items-center">
      <div class="flex justify-center items-center">
        <SvgIcon
          v-if="sticker.icon && sticker.icon.path"
          :icon-set="sticker.icon.set"
          :path="sticker.icon.path"
          :size="iconSize"
        ></SvgIcon>
        <Icon
          v-if="sticker.icon && sticker.icon.raw"
          :icon="sticker.icon.raw"
          :width="iconSize"
          :height="iconSize"
        >
        </Icon>
        <img
          v-if="sticker.imagePath"
          :src="sticker.imagePath"
          :width="iconSize"
          :height="iconSize"
        />
      </div>
    </div>
  </div>
</template>
