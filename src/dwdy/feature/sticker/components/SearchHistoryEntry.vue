<script setup lang="ts">
import { computed, PropType } from "vue";
import { FEATURE_ICON } from "~/dwdy/feature/sticker/def";
import { SearchQuery } from "~/types/dwdy/search";
import SvgIcon from "~/components/SvgIcon.vue";
import StickerIcon from "./StickerIcon.vue";

const props = defineProps({
  query: {
    type: Object as PropType<SearchQuery>,
    required: true,
  },
  enableHover: {
    type: Boolean,
    default: false,
  },
});

const stickers = computed<string[]>(() => {
  return props.query.feature["sticker"] || [];
});
</script>
<template>
  <div
    v-if="stickers.length > 0"
    class="h-fit btn btn-primary rounded-xl flex justify-start items-center pr-1"
    :class="
      props.enableHover
        ? 'btn-outline'
        : 'text-primary bg-base-100 hover:text-primary hover:bg-base-100 cursor-default'
    "
  >
    <SvgIcon
      class="mr-2"
      :icon-set="FEATURE_ICON['main'].set"
      :path="FEATURE_ICON['main'].path"
      :size="24"
    ></SvgIcon>
    <StickerIcon
      v-for="stickerCode in stickers"
      :key="stickerCode"
      class="m-1"
      :code="stickerCode"
      :size-multiplier="0.6"
    ></StickerIcon>
  </div>
</template>
