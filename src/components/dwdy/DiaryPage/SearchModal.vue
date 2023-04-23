<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { mdiMagnify, mdiTextSearchVariant, mdiTrashCan } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { useSearchState } from "~/states/useSearchState";
import { layoutComponent } from "~/dwdy/layout/component";
import { EMPTY_SEARCH_QUERY, isQueryEmpty } from "~/services/dwdy/search";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText, featureIcon } from "~/dwdy/feature/map";
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

const la = new LocaleActor("components.dwdy.DiaryPage.SearchModal");
const dwdyState = useDwdyState();
const searchState = useSearchState();
const isModalOn = ref(false);
const diaryPageSearchModal = ref();

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

const keywordOption = computed<string>({
  get() {
    return searchState.query.value.keywords.join(" ");
  },
  set(value: string) {
    searchState.query.value.keywords = value
      .split(" ")
      .filter((word) => word !== "");
  },
});

function onQueryInputTyped(): void {
  console.log("query typed", searchState.query.value.keywords);
}

function onSearchWithFeatureBtnClicked(feature: DiaryFeature): void {
  emit("triggerAction", {
    action: "open-search-feature-modal",
    cfi: { feature: feature },
  });
}

function onSearchCombinationBtnClicked(): void {
  console.log("search combination");
  // TODO: Store the current query combination
}

function triggerModelUpdate(): void {
  if (diaryPageSearchModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function triggerAction(params: DiaryPageActionParams): void {
  emit("triggerAction", params);
}

function onSearchClearBtnClicked(): void {
  searchState.query.value = Object.assign({}, EMPTY_SEARCH_QUERY);
}
function applySearch(): void {
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
            v-for="(feature, index) in dwdyState.diary.value.enabledFeatures"
            :key="index"
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
          <div class="grow flex justify-end gap-2">
            <button
              class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap"
              @click="onSearchCombinationBtnClicked"
            >
              <SvgIcon
                class="mr-2"
                icon-set="mdi"
                :path="mdiTextSearchVariant"
                :size="24"
              ></SvgIcon>
              {{ la.t(".searchHistory") }}
            </button>
          </div>
        </div>
        <div class="flex justify-between gap-2">
          <input
            ref="queryInput"
            v-model="keywordOption"
            class="flex-1 input input-bordered border-base-200 w-full"
            :placeholder="(la.t('.queryHint') as string)"
            type="text"
            name="query"
            @input="onQueryInputTyped"
          />
          <button
            v-if="!isQueryEmpty(searchState.query.value)"
            class="flex-none btn btn-error btn-outline rounded-full flex items-center flex-nowrap"
            @click="onSearchClearBtnClicked"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiTrashCan"
              :size="24"
            ></SvgIcon>
            {{ la.t(".clear") }}
          </button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
