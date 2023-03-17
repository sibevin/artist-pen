<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mdiDeleteForever } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  addSticker,
  deleteSticker,
  clearAllStickers,
} from "~/dwdy/feature/sticker/action";
import {
  recentStickerCategory,
  stickerCategories,
} from "~/dwdy/feature/sticker/data";
import SvgIcon from "~/components/SvgIcon.vue";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";
import ContentGallery from "~/dwdy/feature/sticker/components/ContentGallery.vue";

const la = new LocaleActor("dwdy.feature.sticker");
const dwdyState = useDwdyState();
const currentStickers = ref<string[]>([]);
const recentStickers = ref<string[]>([]);

const hasStickers = computed<boolean>(() => {
  return currentStickers.value.length > 0;
});

fetchSticker();

watch(
  () => [dwdyState.entry.value],
  () => {
    fetchSticker();
  }
);

function fetchSticker(): void {
  currentStickers.value =
    dwdyState.entry.value.fetchContents<DiaryFeature.Sticker>(
      DiaryFeature.Sticker
    );
  recentStickers.value = [...dwdyState.config.value.doc.recentStickerCodes];
}

function stickerSelectedIndex(code: string): number {
  return currentStickers.value.indexOf(code);
}

async function onStickerSelected(code: string): Promise<void> {
  const targetIndex = stickerSelectedIndex(code);
  if (targetIndex >= 0) {
    currentStickers.value = await deleteSticker(targetIndex);
  } else {
    currentStickers.value = await addSticker(code);
  }
}

async function onClearStickersBtnClicked(): Promise<void> {
  currentStickers.value = [];
  await clearAllStickers();
}
</script>
<template>
  <div class="w-full h-full p-3 pb-0 flex flex-col">
    <div class="flex-none">
      <div class="mb-3 flex justify-between items-center">
        <div
          class="grow min-w-0 rounded border-2 border-dashed border-base-300 p-3"
        >
          <ContentGallery v-if="hasStickers"> </ContentGallery>
          <div v-else class="h-12"></div>
        </div>
        <div v-if="hasStickers" class="flex-none p-3">
          <button
            class="btn btn-circle btn-ghost text-error"
            @click="onClearStickersBtnClicked"
          >
            <SvgIcon
              icon-set="mdi"
              :path="mdiDeleteForever"
              :size="24"
            ></SvgIcon>
          </button>
        </div>
      </div>
      <div class="cell-block mt-6">
        <div class="cell-title flex items-center uppercase px-2">
          <SvgIcon
            class="mr-2"
            :icon-set="recentStickerCategory.icon.set"
            :path="recentStickerCategory.icon.path"
            :size="24"
          ></SvgIcon>
          {{ la.t(`.category.${recentStickerCategory.code}`) }}
        </div>
        <div class="mx-auto flex flex-wrap p-2 max-h-32 overflow-y-hidden">
          <div
            v-for="stickerCode in recentStickers"
            :key="stickerCode"
            class="indicator"
            @click="onStickerSelected(stickerCode)"
          >
            <div
              v-if="stickerSelectedIndex(stickerCode) >= 0"
              class="indicator-item indicator-bottom"
            >
              <div
                class="bg-primary text-base-100 opacity-70 rounded h-6 w-6 -ml-7 -mt-7 p-2 font-bold cursor-pointer flex justify-center items-center"
              >
                {{ stickerSelectedIndex(stickerCode) + 1 }}
              </div>
            </div>
            <StickerIcon
              class="m-1 text-primary cursor-pointer"
              :code="stickerCode"
            ></StickerIcon>
          </div>
        </div>
      </div>
    </div>
    <div class="min-h-0 overflow-y-auto">
      <div v-for="stickerCa in stickerCategories" :key="stickerCa.code">
        <div class="cell-block mt-6 mb-2">
          <div class="cell-title flex items-center uppercase px-2">
            <SvgIcon
              class="mr-2"
              :icon-set="stickerCa.icon.set"
              :path="stickerCa.icon.path"
              :size="24"
            ></SvgIcon>
            {{ la.t(`.category.${stickerCa.code}`) }}
          </div>
          <div class="mx-auto flex flex-wrap p-2">
            <div
              v-for="stickerCode in stickerCa.stickerCodes"
              :key="stickerCode"
              class="indicator"
              @click="onStickerSelected(stickerCode)"
            >
              <div
                v-if="stickerSelectedIndex(stickerCode) >= 0"
                class="indicator-item indicator-bottom"
              >
                <div
                  class="bg-primary text-base-100 opacity-70 rounded h-6 w-6 -ml-7 -mt-7 p-2 font-bold cursor-pointer flex justify-center items-center"
                >
                  {{ stickerSelectedIndex(stickerCode) + 1 }}
                </div>
              </div>
              <StickerIcon
                class="m-1 text-primary cursor-pointer"
                :code="stickerCode"
              ></StickerIcon>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4"></div>
    </div>
  </div>
</template>
