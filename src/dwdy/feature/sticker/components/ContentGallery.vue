<script setup lang="ts">
import { computed } from "vue";
import Flicking from "@egjs/vue3-flicking";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";

const props = defineProps({
  enableClick: {
    type: Boolean,
    default: false,
  },
  stickerAlign: {
    type: String,
    default: "center",
  },
});

const dwdyState = useDwdyState();
const currentStickers = computed<string[]>(() => {
  return dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
    DiaryFeature.Sticker
  );
});
</script>
<template>
  <div v-if="currentStickers.length > 0" class="w-full">
    <Flicking
      class="w-full"
      :options="{
        align: props.stickerAlign,
        bound: true,
      }"
    >
      <div
        v-for="(stickerCode, index) in currentStickers"
        :id="stickerCode"
        :key="index"
        class="panel"
      >
        <StickerIcon class="mx-1" :code="stickerCode"></StickerIcon>
      </div>
    </Flicking>
  </div>
</template>
