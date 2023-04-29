<script setup lang="ts">
import { ref, watch } from "vue";
import Flicking from "@egjs/vue3-flicking";
import { mdiCheck, mdiClose, mdiDeleteForever } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON } from "~/dwdy/feature/sticker/def";
import StickerSelector from "~/dwdy/feature/sticker/components/StickerSelector.vue";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string[]): void;
}>();

const MODAL_ID = "diary-search-feature-sticker-modal";
const la = new LocaleActor("dwdy.feature.sticker");
const searchState = useSearchState();
const isModalOn = ref(false);
const currentStickers = ref<string[]>([]);
const stickerSelector = ref();

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
    if (newValue) {
      currentStickers.value = searchState.query.value.feature.sticker || [];
    }
  }
);

watch(
  () => isModalOn.value,
  () => {
    emit("update:modelValue", isModalOn.value);
  }
);

function onStickersChanged(stickers: string[]): void {
  currentStickers.value = stickers;
}

function onApplyBtnClicked(): void {
  searchState.query.value.feature.sticker = currentStickers.value;
  isModalOn.value = false;
}
</script>
<template>
  <ModalBase
    ref="dateSelectorModel"
    v-model="isModalOn"
    class="fixed z-10 modal-w-3xl"
    :modal-base-id="MODAL_ID"
  >
    <template #modal-title>
      <h2 class="card-title mb-2">
        <SvgIcon
          :icon-set="FEATURE_ICON['main'].set"
          :path="FEATURE_ICON['main'].path"
          :size="24"
        ></SvgIcon>
        {{ featureText(DiaryFeature.Sticker, la) }}
      </h2>
    </template>
    <template #modal-fixed-bottom-panel>
      <div class="max-h-v60 flex flex-col">
        <StickerSelector
          ref="stickerSelector"
          class="min-h-0 flex-1"
          :stickers="currentStickers"
          @change="onStickersChanged"
        ></StickerSelector>
        <div class="flex-none my-3 w-full flex justify-between items-center">
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
              @click="stickerSelector.clearAllStickers()"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiDeleteForever"
                :size="24"
              ></SvgIcon>
            </button>
          </div>
        </div>
        <div class="flex-none card-actions items-center">
          <div class="grow flex items-center">
            <button class="btn btn-primary" @click="onApplyBtnClicked">
              <SvgIcon
                class="mr-2"
                icon-set="mdi"
                :path="mdiCheck"
                :size="16"
              ></SvgIcon>
              {{ la.t("app.action.apply") }}
            </button>
            <label class="btn btn-ghost ml-2" :for="`modal-base_${MODAL_ID}`">
              <SvgIcon
                class="text-base-content mr-2"
                icon-set="mdi"
                :path="mdiClose"
                :size="16"
              ></SvgIcon>
              {{ la.t("app.action.cancel") }}
            </label>
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
