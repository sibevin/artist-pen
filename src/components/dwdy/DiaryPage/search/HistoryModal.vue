<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  mdiDeleteForever,
  mdiMagnify,
  mdiTextSearchVariant,
  mdiTrayArrowDown,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { SearchQuery } from "~/types/dwdy/search";
import {
  addToSearchHistories,
  removeFromSearchHistories,
} from "~/services/dwdy/search";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";
import { Diary } from "~/models/dwdy/diary";
import HistoryPanel from "./HistoryPanel.vue";
import { useSearchState } from "~/states/useSearchState";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select"): void;
}>();

const la = new LocaleActor("components.dwdy.DiaryPage.search");
const dwdyState = useDwdyState();
const searchState = useSearchState();
const isModalOn = ref(false);
const diaryPageSearchHistoryModal = ref();

const recentHistories = computed<SearchQuery[]>(() => {
  return dwdyState.diary.value.doc.searchHistory.recent;
});

const storedHistories = computed<SearchQuery[]>(() => {
  return dwdyState.diary.value.doc.searchHistory.stored;
});

onMounted(() => {
  isModalOn.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
  }
);

watch(
  () => isModalOn.value,
  () => {
    triggerModelUpdate();
  }
);

async function storeQuery(query: SearchQuery): Promise<void> {
  await addToSearchHistories(
    "stored",
    new Diary(dwdyState.diary.value.doc),
    query
  );
}

function applyQuery(query: SearchQuery): void {
  searchState.query.value = JSON.parse(JSON.stringify(query));
  isModalOn.value = false;
  emit("select");
}

async function deleteStoredQuery(index: number): Promise<void> {
  await removeFromSearchHistories(
    "stored",
    new Diary(dwdyState.diary.value.doc),
    index
  );
}

function triggerModelUpdate(): void {
  if (diaryPageSearchHistoryModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}
</script>

<template>
  <ModalBase
    ref="diaryPageSearchHistoryModal"
    v-model="isModalOn"
    class="fixed z-10 modal-w-3xl"
    modal-base-id="diary-page-search-history"
  >
    <template #modal-title>
      <h2 class="card-title mb-2">
        <SvgIcon
          class="text-base-content mr-1"
          icon-set="mdi"
          :path="mdiTextSearchVariant"
          :size="24"
        ></SvgIcon>
        {{ la.t(".searchHistory") }}
      </h2>
    </template>
    <template #modal-content>
      <div class="h-full inset-0 flex flex-col gap-4 pt-2">
        <div class="flex-1 cell-block pt-6 p-3">
          <div class="cell-title">
            {{ la.t(".recentHistories") }}
          </div>
          <div
            v-if="recentHistories.length > 0"
            class="max-h-v30 overflow-y-auto flex flex-col items-stretch gap-3"
          >
            <div
              v-for="(query, index) in recentHistories"
              :key="index"
              class="relative pl-10 p-2 border border-base-200 flex gap-2"
            >
              <div
                class="absolute top-0 left-0 px-2 py-1 rounded-br-lg bg-base-200"
              >
                {{ index + 1 }}
              </div>
              <div class="w-full min-w-0 flex justify-between gap-2">
                <HistoryPanel class="grow" :query="query"></HistoryPanel>
                <button class="flex-none btn" @click="storeQuery(query)">
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiTrayArrowDown"
                    :size="24"
                  ></SvgIcon>
                </button>
                <button
                  class="flex-none btn btn-primary"
                  @click="applyQuery(query)"
                >
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiMagnify"
                    :size="24"
                  ></SvgIcon>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="p-5 flex justify-center items-center">
            {{ la.t(".noHistories") }}
          </div>
        </div>
        <div class="flex-1 cell-block pt-6 p-3">
          <div class="cell-title">
            {{ la.t(".storedHistories") }}
          </div>
          <div
            v-if="storedHistories.length > 0"
            class="max-h-v30 overflow-y-auto flex flex-col items-stretch gap-3"
          >
            <div
              v-for="(query, index) in storedHistories"
              :key="index"
              class="relative pl-10 p-2 border border-base-200 flex gap-2"
            >
              <div
                class="absolute top-0 left-0 px-2 py-1 rounded-br-lg bg-base-200"
              >
                {{ index + 1 }}
              </div>
              <div class="w-full flex justify-between gap-2">
                <HistoryPanel class="grow" :query="query"></HistoryPanel>
                <button
                  class="flex-none btn btn-error"
                  @click="deleteStoredQuery(index)"
                >
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiDeleteForever"
                    :size="24"
                  ></SvgIcon>
                </button>
                <button
                  class="flex-none btn btn-primary"
                  @click="applyQuery(query)"
                >
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiMagnify"
                    :size="24"
                  ></SvgIcon>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="p-5 flex justify-center items-center">
            {{ la.t(".noHistories") }}
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
