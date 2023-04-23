<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { mdiCog, mdiBookshelf, mdiMagnify, mdiCalendarClock } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureComponent } from "~/dwdy/feature/component";
import { layoutComponent } from "~/dwdy/layout/component";
import {
  DiaryContentFeatureIndex,
  DiaryEntryMovementParams,
  DiaryPageActionParams,
} from "~/dwdy/types/core";
import { dtToEntryTs } from "~/dwdy/services/dateUtils";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalDateSelector from "~/components/ModalDateSelector.vue";
import ControlMenu from "~/components/dwdy/common/ControlMenu.vue";
import DiarySettingsModal from "~/components/dwdy/DiaryPage/settings/MainModal.vue";
import FullViewerModal from "~/components/dwdy/DiaryPage/FullViewerModal.vue";
import SearchModal from "~/components/dwdy/DiaryPage/SearchModal.vue";
import FeatureSelectorModal from "~/components/dwdy/common/FeatureSelectorModal.vue";
import { initDwdyStateByRoute } from "~/dwdy/services/initDwdyStateByRoute";

const route = useRoute();
const router = useRouter();
const appState = useAppState();
const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage");
const mainLayout = ref();
const controlMenu = ref();
const contentFullViewer = ref();
const diaryEntrySearchModal = ref();
const pageScope = "diary-page";
const controlMenuSelectedBtn = ref<string>();
const isDiarySettingsMoodalOn = ref(false);
const isCurrentDateSelectorModalOn = ref(false);
const isContentFullViewerModalOn = ref(false);
const isEditorSelectorModalOn = ref(false);
const isDiarySearchModalOn = ref(false);
const isSearchMainModalOn = ref(false);
const isSearchSortModalOn = ref(false);
const isSearchTagModalOn = ref(false);
const isSearchStickerModalOn = ref(false);
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
  } else if (params.action === "open-search-main-modal") {
    isSearchMainModalOn.value = true;
  } else if (params.action === "open-search-sort-modal") {
    isSearchSortModalOn.value = true;
  } else if (params.action === "open-search-feature-modal") {
    if (params.cfi?.feature === DiaryFeature.Tag) {
      isSearchTagModalOn.value = true;
    }
    if (params.cfi?.feature === DiaryFeature.Sticker) {
      isSearchStickerModalOn.value = true;
    }
  } else if (params.action === "apply-search") {
    if (diaryEntrySearchModal.value) {
      diaryEntrySearchModal.value.applySearch();
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
          <div class="flex-none md:hidden">
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
          <div class="hidden md:flex ml-6">
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
      <FeatureSelectorModal
        ref="editorSelector"
        v-model="isEditorSelectorModalOn"
        class="fixed z-10"
        @select="onContentEditorOpen"
      ></FeatureSelectorModal>
      <FullViewerModal
        ref="contentFullViewer"
        v-model="isContentFullViewerModalOn"
        class="fixed z-10"
        @open-content-editor="onContentEditorOpen"
      ></FullViewerModal>
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
      <SearchModal
        ref="diaryEntrySearchModal"
        v-model="isDiarySearchModalOn"
        class="fixed z-10"
        @trigger-action="triggerAction"
      ></SearchModal>
      <component
        :is="
          layoutComponent(dwdyState.diary.value.doc.layout, 'searchMainModal')
        "
        v-model="isSearchMainModalOn"
        @select="triggerAction({ action: 'apply-search' })"
      ></component>
      <component
        :is="
          layoutComponent(dwdyState.diary.value.doc.layout, 'searchSortModal')
        "
        v-model="isSearchSortModalOn"
        @select="triggerAction({ action: 'apply-search' })"
      ></component>
      <component
        :is="featureComponent(DiaryFeature.Tag, 'searchQuerySelector')"
        v-if="dwdyState.diary.value.enabledFeatures.includes(DiaryFeature.Tag)"
        v-model="isSearchTagModalOn"
        @select="triggerAction({ action: 'apply-search' })"
      ></component>
      <component
        :is="featureComponent(DiaryFeature.Sticker, 'searchQuerySelector')"
        v-if="
          dwdyState.diary.value.enabledFeatures.includes(DiaryFeature.Sticker)
        "
        v-model="isSearchStickerModalOn"
        modal-id="diary-search-feature-sticker-modal"
        @select="triggerAction({ action: 'apply-search' })"
      ></component>
    </template>
  </MainLayout>
</template>
