<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { mdiClose, mdiDeleteForever } from "@mdi/js";
import PerfectScrollbar from "perfect-scrollbar";
import {
  recentStickerCategory,
  stickerCategories,
} from "~/models/app/dwdy/diarySticker";
import { bxsSticker } from "~/vendor/iconSetData";
import { UserConfigExistingDoc } from "~/models/app/dwdy/userConfig";
import {
  DiaryEntryExistingDoc,
  updateEntryStickers,
} from "~/models/app/dwdy/diaryEntry";
import "~/assets/vendor/perfect-scrollbar/perfect-scrollbar.css";

interface Props {
  modalId: string;
  stickerCodes: string[];
  modelValue: boolean;
}

const MAX_RECENT_STICKER_COUNT = 24;

const props = defineProps<Props>();
const isModalOn = ref(false);
const selectorModel = ref();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
}>();
const currentStickerCodes = ref<string[]>([]);
const recentStickerCodes = ref<string[]>([]);
const la = useLocaleActor("app.dwdy.sticker");
const { $appDb } = useNuxtApp();
const appState = useAppState();
const editingState = useEditingState();
const stickerSelectorPanel = ref();
let sspPs;

async function initData() {
  const res = await appState.initState({
    appDb: $appDb as PouchDB.Database<UserConfigExistingDoc>,
  });
  if (res.gain) {
    recentStickerCodes.value = res.target.recentStickerCodes;
  }
}
await initData();

onMounted(() => {
  currentStickerCodes.value = props.stickerCodes;
  isModalOn.value = props.modelValue;
  setTimeout(() => {
    if (stickerSelectorPanel.value) {
      sspPs = new PerfectScrollbar(stickerSelectorPanel.value);
    }
  }, 300);
});

onUnmounted(() => {
  if (sspPs) {
    sspPs.destroy();
  }
});

watch(
  () => props.stickerCodes,
  (newValue) => {
    currentStickerCodes.value = newValue;
  }
);

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
  }
);

const modalId = computed<string>(() => {
  return "tag-selector-modal_" + props.modalId;
});

const hasStickers = computed<boolean>(() => {
  return currentStickerCodes.value.length > 0;
});

function stickerSelectedIndex(code: string): number {
  return currentStickerCodes.value.indexOf(code);
}

function addToRecentStickers(code: string): void {
  const targetIndex = recentStickerCodes.value.indexOf(code);
  if (targetIndex >= 0) {
    recentStickerCodes.value.splice(targetIndex, 1);
  }
  recentStickerCodes.value.unshift(code);
  recentStickerCodes.value = recentStickerCodes.value.slice(
    0,
    MAX_RECENT_STICKER_COUNT
  );
  appState.updateConfig({
    appDb: $appDb as PouchDB.Database<UserConfigExistingDoc>,
    configs: {
      recentStickerCodes: recentStickerCodes.value,
    },
  });
}

async function storeEntryStickers(): Promise<void> {
  const apiRes = await updateEntryStickers(
    $appDb as PouchDB.Database<DiaryEntryExistingDoc>,
    editingState.diaryEntry.value.dUid,
    editingState.diaryEntry.value.dIndex,
    currentStickerCodes.value
  );
  if (apiRes.gain) {
    editingState.update({ diaryEntry: apiRes.target });
  }
}

async function onStickerSelected(code: string): Promise<void> {
  const targetIndex = stickerSelectedIndex(code);
  if (targetIndex >= 0) {
    currentStickerCodes.value.splice(targetIndex, 1);
  } else {
    currentStickerCodes.value.push(code);
    addToRecentStickers(code);
  }
  await storeEntryStickers();
}

async function onClearStickersBtnClicked(): Promise<void> {
  currentStickerCodes.value = [];
  await storeEntryStickers();
}

function triggerModelUpdate(): void {
  if (selectorModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onModalToggleChanged(): void {
  isModalOn.value = selectorModel.value.checked;
  triggerModelUpdate();
}
</script>
<template>
  <div>
    <input
      :id="modalId"
      ref="selectorModel"
      type="checkbox"
      class="modal-toggle"
      :checked="isModalOn"
      @change="onModalToggleChanged"
    />
    <div class="modal modal-bottom sm:modal-middle">
      <div class="modal-box card p-0">
        <div class="card-body p-3 md:p-6 min-h-0">
          <h2 class="card-title p-3 mb-4">
            <AppSvgIcon
              class="mr-2"
              icon-set="bxs"
              :path="bxsSticker"
              :size="24"
            ></AppSvgIcon>
            {{ la.t(".name") }}
          </h2>
          <div class="flex justify-between items-center">
            <div
              class="grow min-w-0 rounded border-2 border-dashed border-base-300 p-3"
            >
              <DwdyStickerDisplay
                v-if="hasStickers"
                class="max-w-[22.5rem] mx-auto"
                :codes="currentStickerCodes"
                sticker-align="prev"
              ></DwdyStickerDisplay>
              <div v-else class="h-12"></div>
            </div>
            <div v-if="hasStickers" class="flex-none p-3">
              <button
                class="btn btn-circle btn-ghost text-error"
                @click="onClearStickersBtnClicked"
              >
                <AppSvgIcon
                  icon-set="mdi"
                  :path="mdiDeleteForever"
                  :size="24"
                ></AppSvgIcon>
              </button>
            </div>
          </div>
          <div
            id="sticker_selector_panel"
            ref="stickerSelectorPanel"
            class="relative overflow-y-auto"
          >
            <div class="cell-block mt-4">
              <div class="cell-title flex items-center uppercase px-2">
                <AppSvgIcon
                  class="mr-2"
                  :icon-set="recentStickerCategory.icon.set"
                  :path="recentStickerCategory.icon.path"
                  :size="24"
                ></AppSvgIcon>
                {{ la.t(`.category.${recentStickerCategory.code}`) }}
              </div>
              <div
                class="mx-auto flex flex-wrap p-2 max-h-36 overflow-y-hidden"
              >
                <div
                  v-for="stickerCode in recentStickerCodes"
                  :key="stickerCode"
                  class="indicator"
                  @click="onStickerSelected(stickerCode)"
                >
                  <div
                    v-if="stickerSelectedIndex(stickerCode) >= 0"
                    class="indicator-item indicator-bottom"
                  >
                    <div
                      class="bg-primary text-base-100 opacity-70 rounded h-6 w-6 -ml-7 -mt-7 p-2 font-bold select-none cursor-pointer flex justify-center items-center"
                    >
                      {{ stickerSelectedIndex(stickerCode) + 1 }}
                    </div>
                  </div>
                  <DwdyStickerIcon
                    class="m-2 text-primary cursor-pointer"
                    :code="stickerCode"
                  ></DwdyStickerIcon>
                </div>
              </div>
            </div>
            <div v-for="stickerCa in stickerCategories" :key="stickerCa.code">
              <div class="cell-block mt-6 mb-2">
                <div class="cell-title flex items-center uppercase px-2">
                  <AppSvgIcon
                    class="mr-2"
                    :icon-set="stickerCa.icon.set"
                    :path="stickerCa.icon.path"
                    :size="24"
                  ></AppSvgIcon>
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
                        class="bg-primary text-base-100 opacity-70 rounded h-6 w-6 -ml-7 -mt-7 p-2 font-bold select-none cursor-pointer flex justify-center items-center"
                      >
                        {{ stickerSelectedIndex(stickerCode) + 1 }}
                      </div>
                    </div>
                    <DwdyStickerIcon
                      class="m-2 text-primary cursor-pointer"
                      :code="stickerCode"
                    ></DwdyStickerIcon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute top-0 right-0 p-3">
            <label :for="modalId" class="btn btn-circle btn-ghost">
              <AppSvgIcon
                class="text-base-content"
                icon-set="mdi"
                :path="mdiClose"
                :size="24"
              ></AppSvgIcon>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
