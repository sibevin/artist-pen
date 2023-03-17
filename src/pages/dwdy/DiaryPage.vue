<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  mdiCog,
  mdiBookshelf,
  mdiMagnify,
  mdiCheck,
  mdiClose,
  mdiCalendarClock,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";
import { layoutComponent } from "~/dwdy/layout/component";
import {
  DiaryContentFeatureIndex,
  DiaryEntryMovementParams,
  DiaryPageActionParams,
} from "~/dwdy/types/core";
import { dtToEntryTs } from "~/dwdy/services/dateUtils";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalBase from "~/components/ModalBase.vue";
import ModalDateSelector from "~/components/ModalDateSelector.vue";
import ControlMenu from "~/components/dwdy/common/ControlMenu.vue";
import DiarySettingsModal from "~/components/dwdy/diarySettings/MainModal.vue";
import DiaryContentFullViewerModal from "~/components/dwdy/diaryContent/FullViewerModal.vue";
import DiaryContentEditorSelectorModal from "~/components/dwdy/diaryEditor/FeatureSelectorModal.vue";
import { initDwdyStateByRoute } from "~/dwdy/services/initDwdyStateByRoute";

const route = useRoute();
const router = useRouter();
const appState = useAppState();
const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage");
const mainLayout = ref();
const controlMenu = ref();
const contentFullViewer = ref();
const pageScope = "diary-page";
const controlMenuSelectedBtn = ref<string>();
const isDiarySettingsMoodalOn = ref(false);
const isCurrentDateSelectorModalOn = ref(false);
const isContentFullViewerModalOn = ref(false);
const isEditorSelectorModalOn = ref(false);
const isDiarySearchModalOn = ref(false);
const layoutContentMain = ref();

const currentDate = computed(() => {
  return dwdyState.entry.value.tsDate || new Date();
});

if (!(await initDwdyStateByRoute(dwdyState, route))) {
  router.push({ name: "diaries" });
}

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
function onSettingsBtnClicked() {
  isDiarySettingsMoodalOn.value = true;
}
function onCurrentDateSelectorChanged(givenDt: Date): void {
  moveToEntry({ direction: "current", timestamp: dtToEntryTs(givenDt) });
}
function onContentEditorOpen(cfi: DiaryContentFeatureIndex): void {
  triggerAction({
    action: "open-feature-editor",
    cfi,
    dIndex: dwdyState.entry.value.doc.dIndex,
  });
}

function moveToEntry(params: DiaryEntryMovementParams): void {
  if (layoutContentMain.value) {
    layoutContentMain.value.moveToEntry(params);
  }
}

function triggerAction(params: DiaryPageActionParams): void {
  if (params.action === "select-date") {
    isCurrentDateSelectorModalOn.value = true;
  } else if (params.action === "select-feature-editor") {
    isEditorSelectorModalOn.value = true;
  } else if (params.action === "open-feature-editor") {
    const query = Object.assign(
      {},
      { f: params.cfi?.feature, ci: params.cfi?.index },
      {
        i: params.dIndex || dwdyState.entry.value.doc.dIndex,
        ts: params.timestamp || dwdyState.entry.value.doc.timestamp,
        ai: params.afterDIndex,
      }
    );
    router.push({
      name: "diaryEditor",
      params: {
        uid: dwdyState.diary.value.doc.dUid,
      },
      query: query,
    });
  } else if (params.action === "open-full-viewer") {
    if (contentFullViewer.value) {
      contentFullViewer.value.openModal(params.cfi);
    }
  }
}
</script>

<template>
  <MainLayout ref="mainLayout">
    <div class="relatvie top-0 bottom-0 w-full h-full">
      <component
        :is="layoutComponent(dwdyState.diary.value.doc.layout, 'contentMain')"
        ref="layoutContentMain"
        @trigger-action="triggerAction"
      ></component>
    </div>
    <template #layout-overlay-bottom-panel>
      <ControlMenu
        ref="controlMenu"
        :hotkey-scope="pageScope"
        :is-menu-hide-btn-enabled="true"
        :current-selected-btn="controlMenuSelectedBtn"
      >
        <template #sub-btn-list>
          <div class="flex-none lg:hidden">
            <component
              :is="
                layoutComponent(
                  dwdyState.diary.value.doc.layout,
                  'contentNavMenu'
                )
              "
              :current-date="currentDate"
              @move-to-entry="moveToEntry"
              @trigger-action="triggerAction"
            ></component>
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
                {{ la.t("dwdy.core.menu.shelf") }}
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
            <component
              :is="
                layoutComponent(
                  dwdyState.diary.value.doc.layout,
                  'contentNavMenu'
                )
              "
              :current-date="currentDate"
              @move-to-entry="moveToEntry"
              @trigger-action="triggerAction"
            ></component>
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
      <DiaryContentEditorSelectorModal
        ref="editorSelector"
        v-model="isEditorSelectorModalOn"
        class="fixed z-10"
        @select="onContentEditorOpen"
      ></DiaryContentEditorSelectorModal>
      <DiaryContentFullViewerModal
        ref="contentFullViewer"
        v-model="isContentFullViewerModalOn"
        class="fixed z-10"
        @open-content-editor="onContentEditorOpen"
      ></DiaryContentFullViewerModal>
      <ModalDateSelector
        v-model="isCurrentDateSelectorModalOn"
        modal-id="current-date-selector"
        :current-date="currentDate"
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
