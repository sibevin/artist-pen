<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  mdiCog,
  mdiBookshelf,
  mdiMagnify,
  mdiCheck,
  mdiClose,
  mdiCalendarClock,
} from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalBase from "~/components/ModalBase.vue";
import ModalDateSelector from "~/components/ModalDateSelector.vue";
import ControlMenu from "~/components/dwdy/common/ControlMenu.vue";
import CalendarNavMenu from "~/components/dwdy/diaryLayout/calendar/NavMenu.vue";
import CalendarContentPanel from "~/components/dwdy/diaryLayout/calendar/ContentPanel.vue";
import TimelineNavMenu from "~/components/dwdy/diaryLayout/timeline/NavMenu.vue";
import YmNavPanel from "~/components/dwdy/common/YmNavPanel.vue";
import NotebookNavMenu from "~/components/dwdy/diaryLayout/notebook/NavMenu.vue";
import DiarySettingsModal from "~/components/dwdy/diarySettings/MainModal.vue";
import DiaryContentEditorModal from "~/components/dwdy/diaryContent/EditorModal.vue";
import DiaryContentFullViewerModal from "~/components/dwdy/diaryContent/FullViewerModal.vue";
import DiaryContentEditorSelectorModal from "~/components/dwdy/diaryContent/EditorSelectorModal.vue";
import { LocaleActor } from "~/services/locale";
import { Diary, DIndex } from "~/models/dwdy/diary";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";
import { DiaryLayout } from "~/models/dwdy/layout";
import {
  dIndexToDt,
  dtToDIndex,
  getNeighborDt,
  isDateDIndex,
} from "~/models/dwdy/dateUtils";

const route = useRoute();
const router = useRouter();
const appState = useAppState();
const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage");
const mainLayout = ref();
const controlMenu = ref();
const contentEditor = ref();
const contentFullViewer = ref();
const pageScope = "diary-page";
const controlMenuSelectedBtn = ref<string>();
const isDiarySettingsMoodalOn = ref(false);
const isCurrentDateSelectorModalOn = ref(false);
const isContentEditorModalOn = ref(false);
const isContentFullViewerModalOn = ref(false);
const isEditorSelectorModalOn = ref(false);
const currentDate = ref<Date>(new Date());
const currentDIndex = ref<DIndex>(dtToDIndex(currentDate.value));
const isDiarySearchModalOn = ref(false);

const fetchedDiary = await Diary.fetch(route.params.uid as string);
if (fetchedDiary) {
  dwdyState.diary.value = fetchedDiary;
} else {
  router.push({ name: "diaries" });
}
await dwdyState.fetchEntry(currentDIndex.value);
await dwdyState.fetchBunch(currentDIndex.value);

watch(
  () => currentDate.value,
  async () => {
    currentDIndex.value = dtToDIndex(currentDate.value);
  }
);

watch(
  () => currentDIndex.value,
  async () => {
    await dwdyState.fetchEntry(currentDIndex.value);
  }
);

const navCellSpecs: NavCellSpec[] = [];
navCellSpecs.push({
  cell: {
    name: "menu-shelf-btn",
    start: [0, 1],
  },
  callback: {
    trigger: () => {
      onBackToShelfBtnClicked();
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "menu-search-btn",
    start: [1, 1],
  },
  callback: {
    trigger: () => {
      onSearchBtnClicked();
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "menu-settings-btn",
    start: [2, 1],
  },
  callback: {
    trigger: () => {
      onSettingsBtnClicked();
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "menu-hide-btn",
    start: [3, 1],
  },
  callback: {
    trigger: () => {
      if (controlMenu.value) {
        controlMenu.value.toggleMenu();
      }
    },
    enter: () => {
      controlMenuSelectedBtn.value = "menu-hide";
    },
    leave: () => {
      controlMenuSelectedBtn.value = undefined;
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "menu-bars-btn",
    start: [4, 1],
  },
  callback: {
    trigger: () => {
      if (mainLayout.value) {
        mainLayout.value.openMenu();
      }
    },
    enter: () => {
      controlMenuSelectedBtn.value = "menu-bars";
    },
    leave: () => {
      controlMenuSelectedBtn.value = undefined;
    },
  },
});
const pn = ref<PageNavigator>(new PageNavigator(navCellSpecs));
appState.hk.value.setupHotKeys(pageScope, () => {
  appState.hk.value.registerPageNavigatorKeys(
    pn.value as PageNavigator,
    pageScope
  );
});

function onBackToShelfBtnClicked() {
  router.push({ name: "diaries" });
}
function onSearchBtnClicked() {
  isDiarySearchModalOn.value = true;
}
function moveNavPrevDay(): void {
  console.log("viewer menu: prev day");
  currentDate.value = getNeighborDt(currentDate.value, "prev", "day");
}
function moveNavNextDay(): void {
  console.log("viewer menu: next day");
  currentDate.value = getNeighborDt(currentDate.value, "next", "day");
}
function moveNavPrevMonth(): void {
  console.log("viewer menu: prev month");
  currentDate.value = getNeighborDt(currentDate.value, "prev", "month");
}
function moveNavNextMonth(): void {
  console.log("viewer menu: next month");
  currentDate.value = getNeighborDt(currentDate.value, "next", "month");
}
function moveNavPrevPage(): void {
  console.log("viewer menu: prev page btn");
  const prevDIndex = dwdyState.entry.value.doc.prevDIndex;
  if (prevDIndex) {
    if (isDateDIndex(prevDIndex)) {
      currentDate.value = dIndexToDt(prevDIndex);
    } else {
      currentDIndex.value = prevDIndex;
    }
  }
}
function moveNavNextPage(): void {
  console.log("viewer menu: next page btn");
  const nextDIndex = dwdyState.entry.value.doc.nextDIndex;
  if (nextDIndex) {
    if (isDateDIndex(nextDIndex)) {
      currentDate.value = dIndexToDt(nextDIndex);
    } else {
      currentDIndex.value = nextDIndex;
    }
  }
}
function moveNavToday(): void {
  console.log("viewer menu: today btn");
  currentDate.value = new Date();
}
function moveNavDate(givenDt: Date): void {
  currentDate.value = givenDt;
}
function onSettingsBtnClicked() {
  isDiarySettingsMoodalOn.value = true;
}
function onDateSelectorOpen(): void {
  isCurrentDateSelectorModalOn.value = true;
}
function onCurrentDateSelectorChanged(givenDIndex: DIndex): void {
  currentDate.value = dIndexToDt(givenDIndex);
}
function onEditorSelectorToggled(): void {
  isEditorSelectorModalOn.value = true;
}
function onContentEditorOpen(action: string): void {
  if (contentEditor.value) {
    contentEditor.value.openModal(action);
  }
}
function onFullViewerOpen(): void {
  if (contentFullViewer.value) {
    contentFullViewer.value.openModal();
  }
}
</script>

<template>
  <MainLayout ref="mainLayout">
    <div class="relatvie top-0 bottom-0 w-full h-full">
      <CalendarContentPanel
        v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Calendar"
        @move-nav-next-month="moveNavNextMonth"
        @move-nav-prev-month="moveNavPrevMonth"
        @move-nav-date="moveNavDate"
        @open-date-selector="onDateSelectorOpen"
        @open-content-editor="onContentEditorOpen"
        @open-full-viewer="onFullViewerOpen"
      ></CalendarContentPanel>
    </div>
    <template #header-title> {{ dwdyState.diary.value.doc.title }} </template>
    <template #layout-overlay-top-panel>
      <YmNavPanel
        v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Timeline"
        class="flex md:hidden justify-center backdrop-blur-sm bg-base-100/60 p-1"
        :current-date="currentDate"
        @move-nav-next-month="moveNavNextMonth"
        @move-nav-prev-month="moveNavPrevMonth"
        @open-date-selector="onDateSelectorOpen"
      ></YmNavPanel>
    </template>
    <template #layout-overlay-bottom-panel>
      <ControlMenu
        ref="controlMenu"
        :hotkey-scope="pageScope"
        :is-menu-hide-btn-enabled="true"
        :current-selected-btn="controlMenuSelectedBtn"
      >
        <template #sub-btn-list>
          <div class="flex-none lg:hidden">
            <CalendarNavMenu
              v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Calendar"
              @move-nav-next-day="moveNavNextDay"
              @move-nav-prev-day="moveNavPrevDay"
              @move-nav-next-page="moveNavNextPage"
              @move-nav-prev-page="moveNavPrevPage"
              @move-nav-today="moveNavToday"
              @edit="onEditorSelectorToggled"
            ></CalendarNavMenu>
            <TimelineNavMenu
              v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Timeline"
              :current-date="currentDate"
              @move-nav-next-day="moveNavNextDay"
              @move-nav-prev-day="moveNavPrevDay"
              @move-nav-next-month="moveNavNextMonth"
              @move-nav-prev-month="moveNavPrevMonth"
              @move-nav-next-page="moveNavNextPage"
              @move-nav-prev-page="moveNavPrevPage"
              @move-nav-today="moveNavToday"
            ></TimelineNavMenu>
            <NotebookNavMenu
              v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Notebook"
              :current-d-index="currentDIndex"
              @move-nav-next-page="moveNavNextPage"
              @move-nav-prev-page="moveNavPrevPage"
            ></NotebookNavMenu>
          </div>
        </template>
        <template #main-btn-list>
          <div class="indicator">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >b</span
            >
            <button
              class="btn btn-ghost rounded-full flex items-center"
              :class="pn.isCurrent('menu-shelf-btn') ? 'bg-base-200' : ''"
              @click="onBackToShelfBtnClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiBookshelf" :size="24"></SvgIcon>
              <div class="hidden sm:block ml-2">
                {{ la.t("dwdy.menu.shelf") }}
              </div>
            </button>
          </div>
          <div class="indicator">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >/</span
            >
            <button
              class="btn btn-ghost rounded-full flex items-center"
              :class="pn.isCurrent('menu-search-btn') ? 'bg-base-200' : ''"
              @click="onSearchBtnClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiMagnify" :size="24"></SvgIcon>
              <div class="hidden sm:block ml-2">
                {{ la.t("app.action.search") }}
              </div>
            </button>
          </div>
          <div class="indicator">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >c</span
            >
            <button
              class="btn btn-ghost rounded-full flex items-center"
              :class="pn.isCurrent('menu-settings-btn') ? 'bg-base-200' : ''"
              @click="onSettingsBtnClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiCog" :size="24"></SvgIcon>
              <div class="hidden sm:block ml-2">
                {{ la.t(".menu.settings") }}
              </div>
            </button>
          </div>
          <div class="hidden lg:flex ml-6">
            <CalendarNavMenu
              v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Calendar"
              @move-nav-next-day="moveNavNextDay"
              @move-nav-prev-day="moveNavPrevDay"
              @move-nav-next-page="moveNavNextPage"
              @move-nav-prev-page="moveNavPrevPage"
              @move-nav-today="moveNavToday"
              @edit="onEditorSelectorToggled"
            ></CalendarNavMenu>
            <TimelineNavMenu
              v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Timeline"
              :current-date="currentDate"
              @move-nav-next-day="moveNavNextDay"
              @move-nav-prev-day="moveNavPrevDay"
              @move-nav-next-month="moveNavNextMonth"
              @move-nav-prev-month="moveNavPrevMonth"
              @move-nav-next-page="moveNavNextPage"
              @move-nav-prev-page="moveNavPrevPage"
              @move-nav-today="moveNavToday"
            ></TimelineNavMenu>
            <NotebookNavMenu
              v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Notebook"
              :current-d-index="currentDIndex"
              @move-nav-next-page="moveNavNextPage"
              @move-nav-prev-page="moveNavPrevPage"
            ></NotebookNavMenu>
          </div>
        </template>
      </ControlMenu>
    </template>
    <template #layout-top-layer>
      <DiarySettingsModal
        v-model="isDiarySettingsMoodalOn"
        class="fixed z-10"
        :from-page-scope="pageScope"
      ></DiarySettingsModal>
      <DiaryContentEditorModal
        ref="contentEditor"
        v-model="isContentEditorModalOn"
        class="fixed z-10"
        :feature="dwdyState.editingContent.value.feature"
        :from-page-scope="pageScope"
        @open-full-viewer="onFullViewerOpen"
      ></DiaryContentEditorModal>
      <DiaryContentEditorSelectorModal
        ref="editorSelector"
        v-model="isEditorSelectorModalOn"
        class="fixed z-10"
        @open-content-editor="onContentEditorOpen"
      ></DiaryContentEditorSelectorModal>
      <DiaryContentFullViewerModal
        ref="contentFullViewer"
        v-model="isContentFullViewerModalOn"
        class="fixed z-10"
        :feature="dwdyState.editingContent.value.feature"
        @open-content-editor="onContentEditorOpen"
      ></DiaryContentFullViewerModal>
      <ModalDateSelector
        v-model="isCurrentDateSelectorModalOn"
        modal-id="current-date-selector"
        :current-d-index="currentDIndex"
        @change="onCurrentDateSelectorChanged"
      >
        <template #modal-title>
          <h2 class="card-title mb-4">
            <SvgIcon
              class="mr-1"
              icon-set="mdi"
              :path="mdiCalendarClock"
              :size="24"
            ></SvgIcon>
            {{ la.t(".dateSelector.title") }}
          </h2>
        </template>
      </ModalDateSelector>
      <ModalBase
        v-model="isDiarySearchModalOn"
        class="fixed z-10"
        modal-base-id="diary-show-search"
      >
        <template #modal-title>
          <div>
            <h2 class="card-title mb-2">
              <SvgIcon
                class="text-base-content mr-1"
                icon-set="mdi"
                :path="mdiMagnify"
                :size="24"
              ></SvgIcon>
              {{ la.t("app.action.search") }}
            </h2>
          </div>
        </template>
        <template #modal-content>
          <div>
            <div class="input-hint-block">
              {{ la.t(".creationHint") }}
            </div>
            <div class="card-actions mt-3 items-center">
              <div class="grow flex items-center">
                <button class="btn btn-primary">
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiCheck"
                    :size="16"
                  ></SvgIcon>
                  {{ la.t("app.action.create") }}
                </button>
                <label
                  class="btn btn-ghost ml-2"
                  for="modal-base_diary-show-search"
                >
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
  </MainLayout>
</template>
