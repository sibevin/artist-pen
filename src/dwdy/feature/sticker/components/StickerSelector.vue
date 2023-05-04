<script setup lang="ts">
import { ref, watch, PropType } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import {
  recentStickerCategory,
  stickerCategories,
} from "~/dwdy/feature/sticker/data";
import SvgIcon from "~/components/SvgIcon.vue";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";

const props = defineProps({
  stickers: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emit = defineEmits<{
  (e: "change", value: string[]): void;
  (e: "select", value: string): void;
}>();

const la = new LocaleActor("dwdy.feature.sticker");
const dwdyState = useDwdyState();
const currentStickers = ref<string[]>([]);
const recentStickers = ref<string[]>([]);

fetchSticker();

watch(
  () => [props.stickers],
  () => {
    currentStickers.value = props.stickers;
  }
);

function fetchSticker(): void {
  currentStickers.value = props.stickers;
  updateRecentStickers();
}

function stickerSelectedIndex(code: string): number {
  return currentStickers.value.indexOf(code);
}

function selectSticker(code: string): void {
  const targetIndex = stickerSelectedIndex(code);
  if (targetIndex >= 0) {
    currentStickers.value.splice(targetIndex, 1);
  } else {
    currentStickers.value.push(code);
  }
  emit("select", code);
  emit("change", [...currentStickers.value]);
}

function clearAllStickers(): void {
  currentStickers.value = [];
  emit("change", [...currentStickers.value]);
}

function updateRecentStickers(): void {
  recentStickers.value = [...dwdyState.config.value.doc.recentStickerCodes];
}

defineExpose({ selectSticker, clearAllStickers, updateRecentStickers });
</script>
<template>
  <div class="w-full h-full flex flex-col">
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
              @click="selectSticker(stickerCode)"
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
    </div>
    <div v-if="recentStickers.length > 0" class="flex-none">
      <div class="cell-block mt-4">
        <div class="cell-title flex items-center uppercase px-2">
          <SvgIcon
            class="mr-2"
            :icon-set="recentStickerCategory.icon.set"
            :path="recentStickerCategory.icon.path"
            :size="24"
          ></SvgIcon>
          {{ la.t(`.category.${recentStickerCategory.code}`) }}
        </div>
        <div class="mx-auto flex flex-wrap p-2 max-h-36 overflow-y-hidden">
          <div
            v-for="stickerCode in recentStickers"
            :key="stickerCode"
            class="indicator"
            @click="selectSticker(stickerCode)"
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
  </div>
</template>
