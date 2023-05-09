<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import {
  mdiMagnify,
  mdiTextSearchVariant,
  mdiTrashCan,
  mdiArrowLeftBottom,
  mdiDotsCircle,
  mdiChevronDoubleRight,
  mdiMagnifyClose,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { useSearchState } from "~/states/useSearchState";
import { Diary } from "~/models/dwdy/diary";
import { layoutComponent } from "~/dwdy/layout/component";
import { SearchResult, SearchResultEntry } from "~/types/dwdy/search";
import {
  buildEmptySearchQuery,
  isQueryEmpty,
  addToSearchHistories,
  applyDiaryEntrySearch,
} from "~/services/dwdy/search";
import { featureIcon } from "~/dwdy/feature/map";
import { featureComponent } from "~/dwdy/feature/component";
import { DiaryPageActionParams, DIndex } from "~/types/dwdy/core";
import { ArrayPaginator } from "~/services/arrayPaginator";
import YmdNavPanel from "~/components/dwdy/common/YmdNavPanel.vue";
import PaginationPanel from "~/components/PaginationPanel.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";
import MhlPanel from "./MatchHightlightPanel.vue";

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

const PAGE_SIZE = 50;

const la = new LocaleActor("components.dwdy.DiaryPage.search");
const dwdyState = useDwdyState();
const searchState = useSearchState();
const isModalOn = ref(false);
const diaryPageSearchModal = ref();
const keywordInput = ref<string>("");
const searchStatus = ref<"init" | "in-searching" | "done">("init");
const result = ref<SearchResult>({
  query: buildEmptySearchQuery(),
  entries: [],
});
const resultPaginator = ref<ArrayPaginator<SearchResultEntry>>(
  new ArrayPaginator([], PAGE_SIZE)
);
const searchResultEntry = ref();
const queryInput = ref();

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
    nextTick(() => {
      if (queryInput.value) {
        queryInput.value.select();
      }
    });
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
  searchStatus.value = "init";
  searchState.query.value = buildEmptySearchQuery();
  result.value.entries = [];
  resultPaginator.value = new ArrayPaginator([], PAGE_SIZE);
  keywordInput.value = "";
}

function closeAndMoveToEntry(dIndex?: DIndex): void {
  if (dIndex) {
    emit("triggerAction", { action: "move-to-entry", dIndex });
  }
  isModalOn.value = false;
}

function selectPage(page: number): void {
  resultPaginator.value.page = page;
}

async function applySearch(fromKeywordInput = false): Promise<void> {
  if (!dwdyState.diary.value.doc.dUid) {
    return;
  }
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
  console.log("apply-search: query", searchState.query.value);
  searchStatus.value = "in-searching";
  const appliedResult = await applyDiaryEntrySearch(
    dwdyState.diary.value.doc.dUid,
    searchState.query.value
  );
  searchStatus.value = "done";
  result.value = appliedResult;
  resultPaginator.value = new ArrayPaginator(
    result.value.entries as SearchResultEntry[],
    PAGE_SIZE
  );
  console.log("apply-search: result", result.value);
  if (result.value.entries.length > 0) {
    nextTick(() => {
      console.log("searchResultEntry", searchResultEntry.value);
      searchResultEntry.value[0].focus();
    });
  }
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
      <div class="h-full inset-0 p-1 flex flex-col gap-2">
        <div class="grow overflow-y-auto">
          <SvgIcon
            v-if="searchStatus === 'in-searching'"
            class="text-base-300 animate-spin-slow m-5"
            icon-set="mdi"
            :path="mdiDotsCircle"
            :size="20"
          ></SvgIcon>
          <div v-if="result.entries.length > 0" class="m-1 flex flex-col gap-3">
            <button
              v-for="(resultEntry, index) in resultPaginator.currentEntries()"
              ref="searchResultEntry"
              :key="index"
              class="relative border flex gap-2 focus:outline focus:outline-primary focus:outline-2"
              tabindex="0"
              @click="closeAndMoveToEntry(resultEntry.entry.doc.dIndex)"
              @keydown.enter="closeAndMoveToEntry(resultEntry.entry.doc.dIndex)"
            >
              <div class="flex-none self-stretch text-primary bg-base-200 p-2">
                {{ index + 1 + PAGE_SIZE * (resultPaginator.page - 1) }}
              </div>
              <div class="grow p-3 flex flex-col md:flex-row items-start gap-3">
                <div class="flex-none md:min-w-[14rem] flex">
                  <YmdNavPanel
                    v-if="resultEntry.entry.tsDate"
                    class="cursor-pointer"
                    :enable-selector="false"
                    :current-date="resultEntry.entry.tsDate"
                  ></YmdNavPanel>
                </div>
                <template
                  v-for="feature in dwdyState.diary.value.enabledFeatures"
                  :key="feature"
                >
                  <div
                    v-if="
                      result.query.feature[feature] &&
                      result.query.feature[feature].length > 0
                    "
                    class="flex-1"
                  >
                    <component
                      :is="featureComponent(feature, 'searchResultEntry')"
                      class="w-fit"
                      :entry="resultEntry.entry"
                      :query="result.query"
                    ></component>
                  </div>
                </template>
                <div v-if="result.query.keywords.length > 0" class="flex-1">
                  <div
                    v-for="(match, mIndex) in Object.values(
                      resultEntry.matches
                    ).flat()"
                    :key="mIndex"
                    class="flex items-center"
                  >
                    <div v-if="match.feature">
                      <SvgIcon
                        class="mr-2"
                        :icon-set="featureIcon(match.feature).set"
                        :path="featureIcon(match.feature).path"
                        :size="16"
                      ></SvgIcon>
                    </div>
                    <MhlPanel :match="match"></MhlPanel>
                  </div>
                </div>
                <div class="hidden md:block flex-none w-10"></div>
              </div>
              <div class="absolute top-0 right-0 p-5">
                <SvgIcon
                  class="text-base-300"
                  icon-set="mdi"
                  :path="mdiChevronDoubleRight"
                  :size="24"
                ></SvgIcon>
              </div>
            </button>
          </div>
          <div
            v-else
            class="h-full border-2 border-dashed rounded-lg flex justify-center items-center text-base-300"
          >
            <div
              v-if="searchStatus === 'init'"
              class="flex flex-col items-center"
            >
              <SvgIcon
                class="text-base-200"
                icon-set="mdi"
                :path="mdiMagnify"
                :size="120"
              ></SvgIcon>
              {{ la.t(".initHint") }}
            </div>
            <div
              v-if="searchStatus === 'in-searching'"
              class="flex flex-col items-center"
            >
              <SvgIcon
                class="text-base-200"
                icon-set="mdi"
                :path="mdiMagnify"
                :size="120"
              ></SvgIcon>
              {{ la.t(".inSearchingHint") }}
            </div>
            <div
              v-if="searchStatus === 'done'"
              class="flex flex-col items-center"
            >
              <SvgIcon
                class="text-base-200"
                icon-set="mdi"
                :path="mdiMagnifyClose"
                :size="120"
              ></SvgIcon>
              {{ la.t(".notFoundHint") }}
            </div>
          </div>
        </div>
        <div
          v-if="searchStatus === 'done' && resultPaginator.totalPages > 1"
          class="flex-none pb-4"
        >
          <PaginationPanel
            :total-page="resultPaginator.totalPages"
            :current-page="resultPaginator.page"
            @select="selectPage"
          >
          </PaginationPanel>
        </div>
        <div class="flex-none flex flex-wrap gap-2">
          <component
            :is="
              layoutComponent(
                dwdyState.diary.value.doc.layout,
                'searchQueryMenuEntry'
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
              class="max-w-full"
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
            v-if="
              !isQueryEmpty(searchState.query.value) || keywordInput.length > 0
            "
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
            v-if="
              !isQueryEmpty(searchState.query.value) || searchStatus !== 'init'
            "
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
