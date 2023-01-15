<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useMeta } from "vue-meta";
import {
  mdiMenu,
  mdiBookshelf,
  mdiCog,
  mdiTranslate,
  mdiViewDashboard,
  mdiSquareOutline,
  mdiSquare,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiHelpCircle,
} from "@mdi/js";
import {
  LocaleActor,
  switchLocale,
  localeOptions,
  LOCALE_DATA,
} from "~/services/locale";
import { THEMES } from "~/services/theme";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";
import { useAppState } from "~/states/useAppState";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalSelector from "~/components/ModalSelector.vue";

useMeta({
  title: "Settings",
});

const emit = defineEmits<{
  (e: "reloadPage"): void;
}>();

const la = new LocaleActor("models.app.config");
const router = useRouter();
const appState = useAppState();
const pageScope = "settings-page";
const isLocaleSelectorModalOpen = ref(false);
const mainLayout = ref();

const navCellSpecs: NavCellSpec[] = [];
navCellSpecs.push({
  cell: { name: "locale-switch-btn", start: [0, 0], end: [2, 1] },
  callback: {
    trigger: () => {
      isLocaleSelectorModalOpen.value = true;
    },
  },
});
THEMES.forEach((theme, index) => {
  navCellSpecs.push({
    cell: {
      name: `theme-${theme}-radio`,
      start: [0, index + 1],
      end: [2, index + 2],
    },
    callback: {
      trigger: () => {
        onThemeChanged(theme);
      },
    },
  });
});
navCellSpecs.push({
  cell: {
    name: "nav-shelf-btn",
    start: [0, THEMES.length + 1],
  },
  callback: {
    trigger: () => {
      router.push({ name: "entry" });
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "menu-bar-btn",
    start: [1, THEMES.length + 1],
  },
  callback: {
    trigger: () => {
      if (mainLayout.value) {
        mainLayout.value.openMenu();
      }
    },
  },
});
const pn = ref<PageNavigator>(new PageNavigator(navCellSpecs));
appState.hk.value.setupHotKeys(pageScope, () => {
  appState.hk.value.registerPageNavigatorKeys(
    pn.value as PageNavigator,
    pageScope
  );
  appState.hk.value.registerKey({
    keys: ["b"],
    scope: pageScope,
    callback: () => {
      router.push({ name: "entry" });
    },
  });
  appState.hk.value.registerKey({
    keys: ["0"],
    scope: pageScope,
    callback: () => {
      isLocaleSelectorModalOpen.value = true;
    },
  });
  appState.hk.value.registerKey({
    keys: ["1"],
    scope: pageScope,
    callback: () => {
      pn.value.resetCurrent("theme-snow-radio");
    },
  });
});

const localeDisplay = computed<string>(() => {
  return LOCALE_DATA[appState.config.value.doc.locale];
});

async function onSelectedLocaleChanged(locale: string) {
  appState.config.value.assign({ locale });
  await appState.config.value.save();
  await switchLocale(locale);
  isLocaleSelectorModalOpen.value = false;
  nextTick(() => {
    emit("reloadPage");
  });
}
async function onThemeChanged(theme: string) {
  appState.config.value.assign({ theme });
  await appState.config.value.save();
}
</script>

<template>
  <MainLayout ref="mainLayout">
    <div
      class="m-auto min-h-0 flex flex-col lg:mt-20 md:justify-center mt-3 mb-20"
    >
      <div class="flex flex-col md:flex-row md:justify-center md:items-stretch">
        <div class="flex flex-col justify-between">
          <div
            class="cell-block max-w-md m-3 cursor-pointer"
            :class="{ selected: pn.isCurrent('locale-switch-btn') }"
            @click="isLocaleSelectorModalOpen = true"
          >
            <div class="cell-sub-title">
              <span
                v-if="appState.hk.value.isMarkShown(pageScope)"
                class="hotkey-mark"
                >0</span
              >
            </div>
            <div class="cell-title text-primary">
              <div class="flex items-center">
                <SvgIcon
                  class="mr-2"
                  icon-set="mdi"
                  :path="mdiTranslate"
                  :size="20"
                ></SvgIcon>
                {{ la.t(".field.locale") }}
              </div>
            </div>
            <div class="p-5 flex items-center">
              <div class="text-xl font-bold mr-1">
                {{ localeDisplay[0] }}
              </div>
              {{ localeDisplay.slice(1, localeDisplay.length) }}
            </div>
          </div>

          <div class="grow cell-block max-w-md m-3">
            <div class="cell-title text-primary">
              <div class="flex items-center">
                <SvgIcon
                  class="mr-2"
                  icon-set="mdi"
                  :path="mdiViewDashboard"
                  :size="20"
                ></SvgIcon>
                {{ la.t(".field.theme") }}
              </div>
            </div>
            <div class="cell-sub-title">
              <span
                v-if="appState.hk.value.isMarkShown(pageScope)"
                class="hotkey-mark"
                >1</span
              >
            </div>
            <div
              v-for="theme in THEMES"
              :key="theme"
              class="p-3 m-3 rounded cursor-pointer bg-base-100 flex items-center min-w-72"
              :class="
                pn.isCurrent(`theme-${theme}-radio`) ? 'border-4' : 'border'
              "
              :data-theme="theme"
              @click="onThemeChanged(theme)"
            >
              <input
                type="radio"
                name="radio-1"
                class="radio mr-3"
                :checked="appState.config.value.doc.theme === theme"
              />
              <div class="text-2xl text-primary mr-2">
                {{ la.t(`.enum.theme.${theme}`) }}
              </div>
              <div class="grow"></div>
              <div class="flex flex-col items-end">
                <div class="flex items-center mb-2">
                  <SvgIcon
                    class="self-end ml-2 text-success"
                    icon-set="mdi"
                    :path="mdiCheckCircle"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-error"
                    icon-set="mdi"
                    :path="mdiCloseCircle"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-info"
                    icon-set="mdi"
                    :path="mdiHelpCircle"
                    :size="16"
                  ></SvgIcon>
                </div>
                <div class="flex items-center">
                  <SvgIcon
                    class="self-end ml-2 text-base-content"
                    icon-set="mdi"
                    :path="mdiSquareOutline"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-secondary"
                    icon-set="mdi"
                    :path="mdiSquare"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-primary"
                    icon-set="mdi"
                    :path="mdiSquare"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-base-200"
                    icon-set="mdi"
                    :path="mdiSquare"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-base-300"
                    icon-set="mdi"
                    :path="mdiSquare"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-base-600"
                    icon-set="mdi"
                    :path="mdiSquare"
                    :size="16"
                  ></SvgIcon>
                  <SvgIcon
                    class="self-end ml-2 text-base-content"
                    icon-set="mdi"
                    :path="mdiSquare"
                    :size="16"
                  ></SvgIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #header-title>
      {{ la.t("app.serviceName") }}
    </template>
    <template #header-panel>
      <div class="page-mark">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiCog"
          :size="20"
        ></SvgIcon>
        <div class="text-xs">
          {{ la.t("app.menu.settings") }}
        </div>
      </div>
    </template>
    <template #layout-overlay-bottom-panel>
      <div
        class="w-full border-base-100 backdrop-blur-sm bg-base-100/60 flex justify-between items-center p-3"
      >
        <div class="indicator">
          <span
            v-if="appState.hk.value.isMarkShown('settings')"
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
          <div class="indicator mx-2">
            <span
              v-if="appState.hk.value.isMarkShown('settings')"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >b</span
            >
            <RouterLink
              to="/"
              class="btn btn-ghost rounded-full flex items-center"
              :class="pn.isCurrent('nav-shelf-btn') ? 'bg-base-200' : ''"
            >
              <SvgIcon
                class="mr-2"
                icon-set="mdi"
                :path="mdiBookshelf"
                :size="24"
              ></SvgIcon>
              {{ la.t("dwdy.menu.shelf") }}
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
    <template #layout-top-layer>
      <ModalSelector
        v-model="isLocaleSelectorModalOpen"
        modal-id="locale-selector"
        :current-value="appState.config.value.doc.locale"
        :options="localeOptions()"
        @change="onSelectedLocaleChanged"
      >
        <template #modal-title>
          <h2 class="card-title mb-4">
            <SvgIcon
              class="mr-1"
              icon-set="mdi"
              :path="mdiTranslate"
              :size="24"
            ></SvgIcon>
            {{ la.t(".field.locale") }}
          </h2>
        </template>
      </ModalSelector>
    </template>
  </MainLayout>
</template>
