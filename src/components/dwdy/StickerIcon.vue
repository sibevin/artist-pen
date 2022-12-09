<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { DiarySticker, stickerMap } from "~/models/dwdy/sticker";
interface Props {
  code: string;
}
const props = defineProps<Props>();

const ICON_SIZE = 40;

const sticker = computed<DiarySticker>(() => {
  return stickerMap[props.code] as DiarySticker;
});

const stickerStyle = computed(() => {
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
  return sticker.value.size || ICON_SIZE;
});
</script>

<template>
  <div
    class="bg-base-100 rounded-full shadow-sm flex justify-center items-center"
    :class="stickerClass"
    :style="stickerStyle"
  >
    <div class="w-12 h-12 mask mask-circle flex justify-center items-center">
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
