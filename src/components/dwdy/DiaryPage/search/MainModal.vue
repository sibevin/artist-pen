<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  mdiMagnify,
  mdiTextSearchVariant,
  mdiTrashCan,
  mdiArrowLeftBottom,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { useSearchState } from "~/states/useSearchState";
import { Diary } from "~/models/dwdy/diary";
import { layoutComponent } from "~/dwdy/layout/component";
import {
  buildEmptySearchQuery,
  isQueryEmpty,
  addToSearchHistories,
} from "~/services/dwdy/search";
import { featureComponent } from "~/dwdy/feature/component";
import { DiaryPageActionParams } from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("components.dwdy.DiaryPage.search");
const dwdyState = useDwdyState();
const searchState = useSearchState();
const isModalOn = ref(false);
const diaryPageSearchModal = ref();
const keywordInput = ref<string>("");

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

function triggerModelUpdate(): void {
  if (diaryPageSearchModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function triggerAction(params: DiaryPageActionParams): void {
  emit("triggerAction", params);
}

function onSearchClearBtnClicked(): void {
  searchState.query.value = buildEmptySearchQuery();
  keywordInput.value = "";
}

function applySearch(fromKeywordInput = false): void {
  if (fromKeywordInput) {
    searchState.query.value.keywords = keywordInput.value
      .split(" ")
      .filter((word) => word !== "");
  }
  keywordInput.value = searchState.query.value.keywords.join(" ");
  addToSearchHistories(
    "recent",
    new Diary(dwdyState.diary.value.doc),
    searchState.query.value
  );
  console.log("apply-search", searchState.query.value);
}
defineExpose({ applySearch });
</script>

<template>
  <ModalBase
    ref="diaryPageSearchModal"
    v-model="isModalOn"
    class="fixed z-10 modal-full-m-2"
    modal-base-id="diary-page-search"
  >
    <template #modal-title>
      <h2 class="card-title mb-2">
        <SvgIcon
          class="text-base-content mr-1"
          icon-set="mdi"
          :path="mdiMagnify"
          :size="24"
        ></SvgIcon>
        {{ la.t("app.action.search") }}
      </h2>
    </template>
    <template #modal-content>
      <div class="h-full inset-0 flex flex-col gap-2">
        <div class="grow">[SearchMain]: Calendar</div>
        <div class="flex-none flex flex-wrap gap-2">
          <component
            :is="
              layoutComponent(
                dwdyState.diary.value.doc.layout,
                'searchMainMenuEntry'
              )
            "
            @trigger-action="
              triggerAction({ action: 'open-search-main-modal' })
            "
          ></component>
          <template
            v-for="feature in dwdyState.diary.value.enabledFeatures"
            :key="feature"
          >
            <component
              :is="featureComponent(feature, 'searchMenuEntry')"
              @trigger-action="triggerAction"
            ></component>
          </template>
          <component
            :is="
              layoutComponent(
                dwdyState.diary.value.doc.layout,
                'searchSortMenuEntry'
              )
            "
            @trigger-action="
              triggerAction({ action: 'open-search-sort-modal' })
            "
          ></component>
        </div>
        <div class="flex justify-between gap-2">
          <label class="input-group">
            <input
              ref="queryInput"
              v-model="keywordInput"
              class="flex-1 input input-bordered border-base-200 w-full"
              :placeholder="(la.t('.queryHint') as string)"
              type="search"
              name="query"
              @keyup.enter="applySearch(true)"
            />
            <span
              v-if="keywordInput.length > 0"
              class="bg-base-200 px-2 cursor-pointer"
              @click="applySearch(true)"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiArrowLeftBottom"
                :size="20"
              ></SvgIcon>
            </span>
          </label>
          <button
            v-if="!isQueryEmpty(searchState.query.value)"
            class="flex-none btn btn-primary"
            @click="applySearch(true)"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiMagnify"
              :size="24"
            ></SvgIcon>
            {{ la.t("app.action.search") }}
          </button>
          <button
            v-if="!isQueryEmpty(searchState.query.value)"
            class="flex-none btn btn-error"
            @click="onSearchClearBtnClicked"
          >
            <SvgIcon icon-set="mdi" :path="mdiTrashCan" :size="24"></SvgIcon>
          </button>
          <button
            class="flex-none btn"
            @click="triggerAction({ action: 'open-search-history-modal' })"
          >
            <SvgIcon
              icon-set="mdi"
              :path="mdiTextSearchVariant"
              :size="24"
            ></SvgIcon>
          </button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
