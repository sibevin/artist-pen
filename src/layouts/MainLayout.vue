<script setup lang="ts">
import { ref, watch, useSlots } from "vue";
import { useRouter } from "vue-router";
import {
  mdiClose,
  mdiBookshelf,
  mdiAccountBox,
  mdiStar,
  mdiCog,
  mdiKeyboardOutline,
  mdiArrowUpThick,
  mdiArrowDownThick,
  mdiArrowLeftThick,
  mdiArrowRightThick,
} from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { useAppState } from "~/states/useAppState";
import { LocaleActor } from "~/services/locale";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";
import logoImage from "~/assets/images/app/logo_32x.svg";

const la = new LocaleActor("app");
const router = useRouter();
const appState = useAppState();
const pageScope = "main-layout";
const slots = useSlots();

const isDrawerMenuOn = ref(false);

function openMenu(): void {
  isDrawerMenuOn.value = true;
}

defineExpose({ openMenu });

function triggerMenuBtn(): void {
  isDrawerMenuOn.value = !isDrawerMenuOn.value;
}

const navCellEvents: NavCellSpec[] = [];
navCellEvents.push({
  cell: { name: "menu-shelf", start: [0, 3] },
  callback: {
    trigger: () => {
      router.push({ name: "entry" });
    },
  },
});
navCellEvents.push({
  cell: { name: "menu-bar-btn", start: [0, 4] },
  callback: {
    trigger: () => {
      triggerMenuBtn();
    },
  },
});
navCellEvents.push({
  cell: { name: "menu-about", start: [0, 0] },
  callback: {
    trigger: () => {
      router.push({ name: "about" });
    },
  },
});
navCellEvents.push({
  cell: { name: "menu-settings", start: [0, 1] },
  callback: {
    trigger: () => {
      router.push({ name: "settings" });
    },
  },
});
navCellEvents.push({
  cell: { name: "menu-account", start: [0, 2] },
  callback: {
    trigger: () => {
      router.push({ name: "account" });
    },
  },
});

const pn = ref<PageNavigator>(new PageNavigator(navCellEvents));
appState.hk.value.registerPageNavigatorKeys(
  pn.value as PageNavigator,
  "main-layout"
);
appState.hk.value.registerKey({
  keys: ["m"],
  callback: () => {
    triggerMenuBtn();
  },
});
appState.hk.value.registerKey({
  keys: ["x"],
  scope: pageScope,
  callback: () => {
    isDrawerMenuOn.value = false;
  },
});
appState.hk.value.registerKey({
  keys: ["t"],
  scope: pageScope,
  callback: () => {
    router.push({ name: "about" });
  },
});
appState.hk.value.registerKey({
  keys: ["s"],
  scope: pageScope,
  callback: () => {
    router.push({ name: "settings" });
  },
});
appState.hk.value.registerKey({
  keys: ["a"],
  scope: pageScope,
  callback: () => {
    router.push({ name: "account" });
  },
});
appState.hk.value.registerKey({
  keys: ["b"],
  scope: pageScope,
  callback: () => {
    router.push({ name: "diaries" });
  },
});

watch(
  () => isDrawerMenuOn.value,
  () => {
    if (isDrawerMenuOn.value) {
      appState.hk.value.switchScope(pageScope);
    } else {
      appState.hk.value.switchBackScope();
      pn.value.resetCurrent();
    }
  }
);
</script>
<template>
  <div class="relatvie top-0 bottom-0 w-full h-full">
    <div class="drawer relatvie top-0 bottom-0 w-full h-full">
      <input
        id="whole-drawer"
        v-model="isDrawerMenuOn"
        type="checkbox"
        class="drawer-toggle"
      />
      <div
        class="drawer-content relatvie top-0 bottom-0 w-full h-full overflow-hidden flex flex-col justify-between items-stretch"
      >
        <div
          v-if="slots['header-title'] && slots['header-panel']"
          class="z-10 flex justify-between items-center shadow shadow-base-200/50 bg-base-100"
        >
          <RouterLink to="/" class="p-3">
            <div class="grow flex flex-row items-center">
              <img class="h-10 mr-3" :src="logoImage" alt="" />
              <div class="grow text-xl ml-0">
                <slot name="header-title"></slot>
              </div>
            </div>
          </RouterLink>
          <div class="m-3">
            <slot name="header-panel"></slot>
          </div>
        </div>
        <div
          class="grow min-h-0 flex flex-col justify-between items-stretch bg-base-100"
        >
          <slot name="layout-fixed-top-panel"></slot>
          <div class="grow relative pt-3">
            <div class="absolute inset-0 overflow-y-auto">
              <slot />
            </div>
            <div class="absolute top-0 w-full">
              <slot name="layout-overlay-top-panel"></slot>
              <div
                v-if="appState.hk.value.inHotkeyMode"
                class="absolute top-0 right-0 p-3 backdrop-blur-sm bg-base-100/60 rounded"
              >
                <div
                  class="flex justify-center items-center text-lg font-bold mb-2 border-2 border-primary text-primary px-2 py-1"
                >
                  <span class="mr-2">
                    <SvgIcon
                      icon-set="mdi"
                      :path="mdiKeyboardOutline"
                      :size="24"
                    ></SvgIcon>
                  </span>
                  {{ la.t(".nav.hotkey") }}
                </div>
                <div class="flex justify-end items-center">
                  {{ la.t(".nav.up") }}
                  <span class="hotkey-mark ml-2 px-2">
                    <SvgIcon
                      icon-set="mdi"
                      :path="mdiArrowUpThick"
                      :size="12"
                    ></SvgIcon>
                  </span>
                  <div class="hotkey-mark ml-1">j</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.down") }}
                  <span class="hotkey-mark ml-2 px-2">
                    <SvgIcon
                      icon-set="mdi"
                      :path="mdiArrowDownThick"
                      :size="12"
                    ></SvgIcon>
                  </span>
                  <div class="hotkey-mark ml-1">k</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.left") }}
                  <span class="hotkey-mark ml-2 px-2">
                    <SvgIcon
                      icon-set="mdi"
                      :path="mdiArrowLeftThick"
                      :size="12"
                    ></SvgIcon>
                  </span>
                  <div class="hotkey-mark ml-1">h</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.right") }}
                  <span class="hotkey-mark ml-2 px-2">
                    <SvgIcon
                      icon-set="mdi"
                      :path="mdiArrowRightThick"
                      :size="12"
                    ></SvgIcon>
                  </span>
                  <div class="hotkey-mark ml-1">l</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.next") }}
                  <div class="hotkey-mark ml-2">Tab</div>
                  <div class="hotkey-mark ml-1">n</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.confirm") }}
                  <div class="hotkey-mark ml-2">Enter</div>
                  <div class="hotkey-mark ml-1">Space</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.cancel") }}
                  <div class="hotkey-mark ml-2">Esc</div>
                  <div class="hotkey-mark ml-1">q</div>
                </div>
                <div class="flex justify-end items-center mt-1">
                  {{ la.t(".nav.hint") }}
                  <div class="hotkey-mark ml-2">.</div>
                </div>
              </div>
            </div>
            <div class="absolute bottom-0 w-full z-50">
              <slot name="layout-overlay-bottom-panel"></slot>
            </div>
          </div>
          <slot name="layout-fixed-bottom-panel"></slot>
        </div>
      </div>
      <div class="drawer-side">
        <label for="whole-drawer" class="drawer-overlay"></label>
        <div
          class="w-80 bg-base-100 text-base-content flex flex-col justify-between"
        >
          <div class="flex flex-row items-center shadow shadow-base-200/50 p-3">
            <div class="grow flex flex-row items-center">
              <img class="h-10 mr-3" :src="logoImage" alt="" />
              <div class="grow text-xl ml-0">
                {{ la.t(".serviceName") }}
              </div>
            </div>
          </div>
          <div class="grow flex flex-col-reverse">
            <ul class="menu p-4 overflow-y-auto">
              <li :class="pn.isCurrent('menu-about') ? 'bg-base-200' : ''">
                <RouterLink to="/about">
                  <span
                    v-if="appState.hk.value.isMarkShown(pageScope)"
                    class="mr-1 hotkey-mark"
                    >h</span
                  >
                  <SvgIcon icon-set="mdi" :path="mdiStar" :size="20"></SvgIcon>
                  {{ la.t(".menu.about") }}
                </RouterLink>
              </li>
              <li :class="pn.isCurrent('menu-settings') ? 'bg-base-200' : ''">
                <RouterLink to="/settings">
                  <span
                    v-if="appState.hk.value.isMarkShown(pageScope)"
                    class="mr-1 hotkey-mark"
                    >s</span
                  >
                  <SvgIcon icon-set="mdi" :path="mdiCog" :size="20"></SvgIcon>
                  {{ la.t(".menu.settings") }}
                </RouterLink>
              </li>
              <li :class="pn.isCurrent('menu-account') ? 'bg-base-200' : ''">
                <RouterLink to="/account">
                  <span
                    v-if="appState.hk.value.isMarkShown(pageScope)"
                    class="mr-1 hotkey-mark"
                    >a</span
                  >
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiAccountBox"
                    :size="20"
                  ></SvgIcon>
                  {{ la.t(".menu.account") }}
                </RouterLink>
              </li>
              <li :class="pn.isCurrent('menu-shelf') ? 'bg-base-200' : ''">
                <RouterLink to="/">
                  <span
                    v-if="appState.hk.value.isMarkShown(pageScope)"
                    class="mr-1 hotkey-mark"
                    >b</span
                  >
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiBookshelf"
                    :size="20"
                  ></SvgIcon>
                  {{ la.t("dwdy.menu.shelf") }}
                </RouterLink>
              </li>
            </ul>
          </div>
          <div class="m-4 pl-0.5">
            <div class="indicator">
              <span
                v-if="appState.hk.value.isMarkShown(pageScope)"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >x</span
              >
              <label
                for="whole-drawer"
                class="btn btn-circle btn-ghost"
                :class="pn.isCurrent('menu-bar-btn') ? 'bg-base-200' : ''"
              >
                <SvgIcon icon-set="mdi" :path="mdiClose" :size="24"></SvgIcon>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="layout-top-layer"></slot>
  </div>
</template>
