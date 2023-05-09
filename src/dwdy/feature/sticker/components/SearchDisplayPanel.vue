<script setup lang="ts">
import { PropType } from "vue";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON, StickerValue } from "~/dwdy/feature/sticker/def";
import SvgIcon from "~/components/SvgIcon.vue";
import StickerIcon from "./StickerIcon.vue";

const props = defineProps({
  stickers: {
    type: Array as PropType<StickerValue[]>,
    required: true,
  },
  highlightStickers: {
    type: Array as PropType<StickerValue[]>,
    default: () => [],
  },
});

const la = new LocaleActor("dwdy.feature.sticker");
</script>
<template>
  <div class="flex justify-start items-center">
    <SvgIcon
      class="flex-none"
      :icon-set="FEATURE_ICON['main'].set"
      :path="FEATURE_ICON['main'].path"
      :size="24"
    ></SvgIcon>
    <div
      v-if="props.stickers.length > 0"
      class="ml-1 -mr-2 flex items-center flex-wrap"
    >
      <StickerIcon
        v-for="stickerCode in stickers"
        :key="stickerCode"
        class="m-1"
        :class="props.highlightStickers.includes(stickerCode) ? 'border-2' : ''"
        :code="stickerCode"
        :size-multiplier="0.6"
      ></StickerIcon>
    </div>
    <div v-else class="ml-2">
      {{ featureText(DiaryFeature.Sticker, la) }}
    </div>
  </div>
</template>
