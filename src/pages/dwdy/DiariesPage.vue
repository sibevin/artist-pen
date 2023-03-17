<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useFocus } from "@vueuse/core";
import { useMeta } from "vue-meta";
import {
  mdiPlus,
  mdiMagnify,
  mdiMenu,
  mdiClose,
  mdiBookshelf,
  mdiSortAscending,
  mdiHelpCircle,
} from "@mdi/js";
import { elRdBook } from "~/services/iconSetPath";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { DUid } from "~/dwdy/types/core";
import { Diary } from "~/models/dwdy/diary";
import { DiarySortedBy, diarySortedByOpts } from "~/dwdy/services/configOption";
import { featureIcon } from "~/dwdy/feature/map";
import { dispatchAuth } from "~/services/flow/auth";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";
import { layoutComponent } from "~/dwdy/layout/component";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalBase from "~/components/ModalBase.vue";
import ModalSelector from "~/components/ModalSelector.vue";
import DiaryCreationModal from "~/components/dwdy/DiaryCreationModal.vue";

useMeta({
  title: "Diaries",
});

await dispatchAuth();

const la = new LocaleActor("pages.dwdy.DiariesPage");
const appState = useAppState();
const dwdyState = useDwdyState();
const router = useRouter();

const diaries = ref<Diary[]>([]);
const currentDiarySortedBy = ref(dwdyState.config.value.doc.diariesSortedBy);
const queryKeyword = ref("");
const isDiaryCreationMoodalOn = ref(false);
const isDiariesSortingMoodalOn = ref(false);
const isDiaryFeatureHelpMoodalOn = ref(false);
const mainLayout = ref();

const diaryList = ref();
const diaryListEntries = ref();
const diaryCreationBtn = ref();
const queryInput = ref();
const { focused: isQueryInputFocused } = useFocus(queryInput);

const pn = ref<PageNavigator>(new PageNavigator([]));

const pageScope = "diaries-page";
const diaryQueryScope = "diary-query-input";

function triggerDiarySearch(): void {
  if (queryInput.value) {
    isQueryInputFocused.value = !isQueryInputFocused.value;
  }
  if (isQueryInputFocused.value) {
    appState.hk.value.inHotkeyMode = false;
    appState.hk.value.switchScope(diaryQueryScope);
    pn.value.resetCurrent();
  } else {
    appState.hk.value.switchScope(pageScope);
    pn.value.moveNext();
  }
}

function onDiarySortingBtnClicked(): void {
  isDiariesSortingMoodalOn.value = true;
}

function scrollDiaryList({
  index,
  toCreationBtn = false,
}: {
  index?: number;
  toCreationBtn?: boolean;
}): void {
  nextTick(() => {
    let targetEle;
    if (index !== undefined && diaryListEntries.value[index]) {
      targetEle = diaryListEntries.value[index];
    }
    if (toCreationBtn) {
      targetEle = diaryCreationBtn.value;
    }
    if (targetEle) {
      const eleBcr = targetEle.getBoundingClientRect();
      const listBcr = diaryList.value.getBoundingClientRect();
      diaryList.value.scrollBy({
        top: eleBcr.top - listBcr.top - 14,
        behavior: "smooth",
      });
    }
  });
}

function routeToDiaryPage(uid: DUid): void {
  router.push({ name: "diary", params: { uid } });
}

function updatePnCellSpec(): void {
  const navCellSpecs: NavCellSpec[] = [];
  diaries.value.forEach((diary, index) => {
    navCellSpecs.push({
      cell: {
        name: `diary-${diary.uid}`,
        start: [0, index],
        end: [3, index + 1],
      },
      callback: {
        trigger: () => {
          routeToDiaryPage(diary.uid as DUid);
        },
        enter: () => {
          scrollDiaryList({ index });
        },
      },
    });
  });
  navCellSpecs.push({
    cell: {
      name: "diary-creation-btn",
      start: [0, diaries.value.length],
      end: [2, diaries.value.length + 1],
    },
    callback: {
      trigger: () => {
        isDiaryCreationMoodalOn.value = true;
      },
      enter: () => {
        scrollDiaryList({ toCreationBtn: true });
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: "diary-search-input",
      start: [0, diaries.value.length + 1],
    },
    callback: {
      trigger: () => {
        triggerDiarySearch();
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: "diary-sort-btn",
      start: [1, diaries.value.length + 1],
    },
    callback: {
      trigger: () => {
        onDiarySortingBtnClicked();
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: "menu-bar-btn",
      start: [2, diaries.value.length + 1],
    },
    callback: {
      trigger: () => {
        if (mainLayout.value) {
          mainLayout.value.openMenu();
        }
      },
    },
  });
  pn.value.resetCellSpec(navCellSpecs);
}

async function updateDiaries(): Promise<void> {
  diaries.value = await Diary.list({
    sortedBy: dwdyState.config.value.doc.diariesSortedBy,
    keyword: queryKeyword.value,
  });
  updatePnCellSpec();
}

updateDiaries();
appState.hk.value.setupHotKeys(pageScope, () => {
  appState.hk.value.registerPageNavigatorKeys(
    pn.value as PageNavigator,
    pageScope
  );
  appState.hk.value.registerKey({
    keys: ["s"],
    scope: pageScope,
    callback: () => {
      onDiarySortingBtnClicked();
    },
  });
  appState.hk.value.registerKey({
    keys: ["o"],
    scope: pageScope,
    callback: () => {
      isDiaryCreationMoodalOn.value = true;
    },
  });
  appState.hk.value.registerKey({
    keys: ["/"],
    scope: pageScope,
    callback: () => {
      triggerDiarySearch();
    },
  });
  appState.hk.value.registerKey({
    keys: ["/", "Enter"],
    scope: diaryQueryScope,
    callback: () => {
      triggerDiarySearch();
    },
  });
  appState.hk.value.registerKey({
    keys: ["Escape"],
    scope: diaryQueryScope,
    callback: () => {
      triggerDiarySearch();
    },
  });
});

watch([() => currentDiarySortedBy.value, () => queryKeyword.value], () =>
  updateDiaries()
);

async function onDiarySortingChanged(value: string): Promise<void> {
  currentDiarySortedBy.value = value as DiarySortedBy;
  dwdyState.config.value.assign({
    diariesSortedBy: currentDiarySortedBy.value,
  });
  await dwdyState.config.value.save();
}
</script>

<template>
  <MainLayout ref="mainLayout">
    <div
      ref="diaryList"
      class="absolute inset-0 flex flex-col p-3 pb-20 overflow-y-auto"
    >
      <div
        v-for="(diary, index) in diaries"
        :key="index"
        ref="diaryListEntries"
      >
        <button
          class="mb-3 p-5 flex flex-col justify-between border-2 w-full"
          :class="
            pn.isCurrent(`diary-${diary.uid}`)
              ? 'border-base-200'
              : 'border-base-100'
          "
          @click="routeToDiaryPage(diary.uid as DUid)"
        >
          <div class="flex mb-2">
            <SvgIcon
              class="mr-2 flex-none"
              icon-set="el"
              :path="elRdBook"
              :size="32"
            ></SvgIcon>
            <div class="text-2xl whitespace-normal">
              {{ diary.doc.title }}
            </div>
          </div>
          <div class="flex items-center">
            <component
              :is="layoutComponent(diary.doc.layout, 'lastContentPanel')"
              :diary="diary"
            ></component>
            <div class="text-base-200 flex items-center">
              <SvgIcon
                v-for="feature in diary.enabledFeatures"
                :key="feature"
                class="mr-3"
                :icon-set="featureIcon(feature).set"
                :path="featureIcon(feature).path"
                :size="20"
              ></SvgIcon>
            </div>
          </div>
        </button>
      </div>
      <button
        ref="diaryCreationBtn"
        type="button"
        class="w-full p-6 flex flex-col justify-center items-center"
        :class="
          pn.isCurrent('diary-creation-btn')
            ? 'border-4 rounded-lg border-base-200'
            : 'border-2 rounded border-dashed border-base-300 '
        "
        @click="isDiaryCreationMoodalOn = true"
      >
        <SvgIcon
          class="mb-3 text-base-200"
          icon-set="el"
          :path="elRdBook"
          :size="54"
        ></SvgIcon>
        <div class="indicator">
          <div
            v-if="appState.hk.value.isMarkShown(pageScope)"
            class="indicator-item indicator-middle -mr-6 hotkey-mark"
          >
            o
          </div>
          <div class="text-lg flex items-center text-base-300">
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiPlus"
              :size="24"
            ></SvgIcon>
            {{ la.t(".newDiary") }}
          </div>
        </div>
      </button>
    </div>
    <template #header-title>
      {{ la.t("app.serviceName") }}
    </template>
    <template #header-panel>
      <div class="page-mark">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiBookshelf"
          :size="20"
        ></SvgIcon>
        <div class="text-xs">
          {{ la.t("dwdy.core.menu.shelf") }}
        </div>
      </div>
    </template>
    <template #layout-overlay-bottom-panel>
      <div
        class="w-full border-base-100 backdrop-blur-sm bg-base-100/60 flex justify-between items-center p-3"
      >
        <div class="indicator">
          <span
            v-if="appState.hk.value.isMarkShown(pageScope)"
            class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
            >m</span
          >
          <label
            for="whole-drawer"
            class="btn btn-circle btn-ghost rounded-full"
            :class="pn.isCurrent('menu-bar-btn') ? 'bg-base-200' : ''"
          >
            <SvgIcon
              class="text-base-content"
              icon-set="mdi"
              :path="mdiMenu"
              :size="24"
            ></SvgIcon>
          </label>
        </div>
        <div class="grow flex justify-center items-center">
          <div class="indicator mr-2">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="indicator-item indicator-bottom hotkey-mark"
              >/</span
            >
            <div
              class="form-control"
              :class="
                pn.isCurrent('diary-search-input')
                  ? 'border-2 border-base-200 rounded'
                  : ''
              "
            >
              <label class="input-group input-group-sm">
                <span class="bg-base-200 px-1">
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiMagnify"
                    :size="24"
                  ></SvgIcon>
                </span>
                <input
                  ref="queryInput"
                  v-model="queryKeyword"
                  type="search"
                  :placeholder="la.t('.queryKeywordHint') as string"
                  class="input input-bordered input-sm border-base-200 w-28"
                />
              </label>
            </div>
          </div>
          <div class="indicator">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >s</span
            >
            <div v-for="opt in diarySortedByOpts(la)" :key="opt.value">
              <button
                v-if="(currentDiarySortedBy as DiarySortedBy) === opt.value"
                class="btn btn-ghost rounded-full flex items-center"
                :class="pn.isCurrent('diary-sort-btn') ? 'bg-base-200' : ''"
                @click="onDiarySortingBtnClicked"
              >
                <SvgIcon
                  v-if="opt.icon"
                  class="mr-2"
                  :icon-set="opt.icon.set"
                  :path="opt.icon.path"
                  :size="24"
                ></SvgIcon>
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #layout-top-layer>
      <DiaryCreationModal
        v-model="isDiaryCreationMoodalOn"
        class="fixed z-10"
        :help-btn-enabled="true"
        :from-page-scope="pageScope"
        @trigger-help="isDiaryFeatureHelpMoodalOn = true"
      ></DiaryCreationModal>
      <ModalSelector
        v-model="isDiariesSortingMoodalOn"
        modal-id="diaries-sorting-selector"
        :current-value="currentDiarySortedBy"
        :options="diarySortedByOpts(la)"
        :icon-enabled="true"
        @change="onDiarySortingChanged"
      >
        <template #modal-title>
          <h2 class="card-title mb-4">
            <SvgIcon
              class="mr-1"
              icon-set="mdi"
              :path="mdiSortAscending"
              :size="24"
            ></SvgIcon>
            {{ la.t("models.dwdy.config.field.diariesSortedBy") }}
          </h2>
        </template>
      </ModalSelector>
      <ModalBase
        v-model="isDiaryFeatureHelpMoodalOn"
        class="fixed z-10"
        modal-base-id="diary-index-diary-feature-help"
      >
        <template #modal-title>
          <div>
            <h2 class="card-title mb-2">
              <SvgIcon
                class="text-base-content mr-1"
                icon-set="mdi"
                :path="mdiHelpCircle"
                :size="24"
              ></SvgIcon>
              {{ la.t("models.dwdy.diary.field.enabledFeatures") }}
            </h2>
          </div>
        </template>
        <template #modal-content>
          <div>
            <div class="mt-3">
              {{ la.t("models.dwdy.diary.hint.enabledFeatures") }}
            </div>
            <div class="card-actions mt-6 items-center">
              <div class="grow flex items-center">
                <label
                  for="modal-base_diary-index-diary-feature-help"
                  class="btn btn-primary"
                >
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiClose"
                    :size="16"
                  ></SvgIcon>
                  {{ la.t("app.action.close") }}
                </label>
              </div>
            </div>
          </div>
        </template>
      </ModalBase>
    </template>
  </MainLayout>
</template>
