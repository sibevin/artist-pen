<script setup lang="ts">
import { ref, watch } from "vue";
import Flicking from "@egjs/vue3-flicking";
import { mdiDeleteForever } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  addSticker,
  deleteSticker,
  clearAllStickers,
} from "~/dwdy/feature/sticker/action";
import StickerSelector from "~/dwdy/feature/sticker/components/StickerSelector.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";

const dwdyState = useDwdyState();
const entryStickers = ref<string[]>([]);
const currentStickers = ref<string[]>([]);
const stickerSelector = ref();

fetchSticker();

watch(
  () => [dwdyState.entry.value],
  () => {
    fetchSticker();
  }
);

function fetchSticker(): void {
  const fetchedStickers =
    dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
      DiaryFeature.Sticker
    );
  entryStickers.value = [...fetchedStickers];
  currentStickers.value = [...fetchedStickers];
}

function stickerSelectedIndex(code: string): number {
  return currentStickers.value.indexOf(code);
}

async function onStickerSelected(code: string): Promise<void> {
  const targetIndex = stickerSelectedIndex(code);
  if (targetIndex >= 0) {
    await deleteSticker(targetIndex);
  } else {
    await addSticker(code);
  }
  if (stickerSelector.value) {
    stickerSelector.value.updateRecentStickers();
  }
}

function onStickersChanged(stickers: string[]): void {
  currentStickers.value = stickers;
}

async function onClearStickersBtnClicked(): Promise<void> {
  await clearAllStickers();
  if (stickerSelector.value) {
    stickerSelector.value.clearAllStickers();
  }
}
</script>
<template>
  <div class="w-full h-full p-3 flex flex-col">
    <div class="min-h-0 flex-1">
      <StickerSelector
        ref="stickerSelector"
        :stickers="entryStickers"
        @select="onStickerSelected"
        @change="onStickersChanged"
      ></StickerSelector>
    </div>
    <div class="flex-none mt-3 w-full flex justify-between items-center">
      <div
        class="grow min-w-0 rounded border-2 border-dashed border-base-300 p-3"
      >
        <div v-if="currentStickers.length > 0" class="w-full">
          <Flicking
            class="w-full"
            :options="{
              align: 'center',
              bound: true,
            }"
          >
            <div
              v-for="(stickerCode, index) in currentStickers"
              :id="stickerCode"
              :key="index"
              class="panel"
            >
              <StickerIcon
                class="mx-1 cursor-pointer"
                :code="stickerCode"
                @click="stickerSelector.selectSticker(stickerCode)"
              ></StickerIcon>
            </div>
          </Flicking>
        </div>
        <div v-else class="h-12"></div>
      </div>
      <div v-if="currentStickers.length > 0" class="flex-none p-3">
        <button
          class="btn btn-circle btn-ghost text-error"
          @click="onClearStickersBtnClicked"
        >
          <SvgIcon icon-set="mdi" :path="mdiDeleteForever" :size="24"></SvgIcon>
        </button>
      </div>
    </div>
  </div>
</template>
