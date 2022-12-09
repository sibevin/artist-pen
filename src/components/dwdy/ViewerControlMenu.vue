<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import {
  mdiMenu,
  mdiFileDocumentEditOutline,
  mdiMagnify,
  mdiCog,
  mdiMenuOpen,
  mdiBookshelf,
  mdiChevronRight,
  mdiChevronLeft,
  mdiPageFirst,
  mdiPageLast,
  mdiMenuRight,
  mdiMenuLeft,
  mdiCalendarToday,
} from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";

interface Props {
  menuEntries: string[];
  isMenuHideBtnEnabled: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "triggerEdit"): void;
  (e: "triggerSearch"): void;
  (e: "triggerSettings"): void;
  (e: "triggerPrevDay"): void;
  (e: "triggerNextDay"): void;
  (e: "triggerPrevMonth"): void;
  (e: "triggerNextMonth"): void;
  (e: "triggerPrevPage"): void;
  (e: "triggerNextPage"): void;
  (e: "triggerToday"): void;
}>();

const la = new LocaleActor("dwdy");
const router = useRouter();
const appState = useAppState();
const dwdyState = useDwdyState();
const inHotkeyMode = ref(false);
const isMenuShown = ref<boolean>(dwdyState.config.value.doc.isContentMenuShown);

const isMenuOpen = computed<boolean>(() => {
  if (props.isMenuHideBtnEnabled === false) {
    return true;
  }
  return isMenuShown.value;
});

const pageScope = "diary-page";
appState.hk.value.registerKey({
  keys: ["b"],
  scope: pageScope,
  callback: () => {
    onBackToShelfBtnClicked();
  },
});

appState.hk.value.registerKey({
  keys: ["t"],
  scope: pageScope,
  callback: () => {
    toggleContentMenuBtnClicked();
  },
});

watch(
  () => appState.hk.value.inHotkeyMode,
  (newValue) => {
    if (newValue) {
      inHotkeyMode.value = newValue;
    } else {
      inHotkeyMode.value = false;
    }
  }
);

async function toggleContentMenuBtnClicked(): Promise<void> {
  isMenuShown.value = !isMenuShown.value;
  dwdyState.config.value.assign({
    isContentMenuShown: isMenuShown.value,
  });
  await dwdyState.config.value.save();
}

function onEditBtnClicked(): void {
  emit("triggerEdit");
}
function onSearchBtnClicked(): void {
  emit("triggerSearch");
}
function onSettingsBtnClicked(): void {
  emit("triggerSettings");
}
function onPrevDayClicked(): void {
  emit("triggerPrevDay");
}
function onNextDayClicked(): void {
  emit("triggerNextDay");
}
function onPrevMonthClicked(): void {
  emit("triggerPrevMonth");
}
function onNextMonthClicked(): void {
  emit("triggerNextMonth");
}
function onPrevPageClicked(): void {
  emit("triggerPrevPage");
}
function onNextPageClicked(): void {
  emit("triggerNextPage");
}
function onTodayClicked(): void {
  emit("triggerToday");
}
function onBackToShelfBtnClicked() {
  router.push({
    path: `/dwdy/diaries`,
  });
}
</script>
<template>
  <div class="relative">
    <Transition name="menu-open">
      <div
        v-if="isMenuOpen"
        class="w-full border-base-100 backdrop-blur-sm bg-base-100/80 flex justify-between items-center p-3 pr-14"
      >
        <div class="indicator">
          <span
            v-if="inHotkeyMode"
            class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
            >m</span
          >
          <label
            for="whole-drawer"
            class="btn btn-circle btn-ghost rounded-full"
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
          <div v-if="props.menuEntries.includes('shelf')">
            <div class="indicator">
              <span
                v-if="inHotkeyMode"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >b</span
              >
              <button
                class="btn btn-ghost rounded-full flex items-center"
                @click="onBackToShelfBtnClicked"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiBookshelf"
                  :size="24"
                ></SvgIcon>
                <div class="hidden sm:block ml-2">
                  {{ la.t(".menu.shelf") }}
                </div>
              </button>
            </div>
          </div>
          <div v-if="props.menuEntries.includes('search')">
            <div class="indicator">
              <span
                v-if="inHotkeyMode"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >/</span
              >
              <button
                class="btn btn-ghost rounded-full flex items-center"
                @click="onSearchBtnClicked"
              >
                <SvgIcon icon-set="mdi" :path="mdiMagnify" :size="24"></SvgIcon>
                <div class="hidden sm:block ml-2">
                  {{ la.t("app.action.search") }}
                </div>
              </button>
            </div>
          </div>
          <div v-if="props.menuEntries.includes('settings')">
            <div class="indicator">
              <span
                v-if="inHotkeyMode"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >s</span
              >
              <button
                class="btn btn-ghost rounded-full flex items-center"
                @click="onSettingsBtnClicked"
              >
                <SvgIcon icon-set="mdi" :path="mdiCog" :size="24"></SvgIcon>
                <div class="hidden sm:block ml-2">
                  {{ la.t(".menu.settings") }}
                </div>
              </button>
            </div>
          </div>
          <div v-if="props.menuEntries.includes('edit')">
            <div class="indicator">
              <span
                v-if="inHotkeyMode"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >e</span
              >
              <button
                class="btn btn-ghost rounded-full flex items-center"
                @click="onEditBtnClicked"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiFileDocumentEditOutline"
                  :size="24"
                ></SvgIcon>
                <div class="hidden sm:block ml-2">
                  {{ la.t("app.action.edit") }}
                </div>
              </button>
            </div>
          </div>
          <div
            v-if="props.menuEntries.includes('nav')"
            class="ml-8 hidden md:flex items-center"
          >
            <button
              v-if="dwdyState.navInfo.value.prevPageDt"
              class="btn btn-ghost rounded-full px-2"
              @click="onPrevPageClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiPageFirst" :size="24"></SvgIcon>
            </button>
            <div
              v-else
              class="btn btn-ghost rounded-full px-2 text-base-300 hover:bg-base-100 cursor-default"
            >
              <SvgIcon icon-set="mdi" :path="mdiPageFirst" :size="24"></SvgIcon>
            </div>
            <button
              class="btn btn-ghost rounded-full px-2"
              @click="onPrevDayClicked"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiChevronLeft"
                :size="24"
              ></SvgIcon>
            </button>
            <button
              v-if="!dwdyState.navInfo.value.isToday"
              class="btn btn-ghost rounded-full"
              @click="onTodayClicked"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiCalendarToday"
                :size="24"
              ></SvgIcon>
              {{ la.t(".nav.today") }}
            </button>
            <div
              v-else
              class="btn btn-ghost rounded-full text-base-300 hover:bg-base-100 cursor-default"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiCalendarToday"
                :size="24"
              ></SvgIcon>
              {{ la.t(".nav.today") }}
            </div>
            <button
              class="btn btn-ghost rounded-full px-2"
              @click="onNextDayClicked"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiChevronRight"
                :size="24"
              ></SvgIcon>
            </button>
            <button
              v-if="dwdyState.navInfo.value.nextPageDt"
              class="btn btn-ghost rounded-full px-2"
              @click="onNextPageClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiPageLast" :size="24"></SvgIcon>
            </button>
            <div
              v-else
              class="btn btn-ghost rounded-full px-2 text-base-300 hover:bg-base-100 cursor-default"
            >
              <SvgIcon icon-set="mdi" :path="mdiPageLast" :size="24"></SvgIcon>
            </div>
          </div>
          <div
            v-if="props.menuEntries.includes('timeline-nav')"
            class="ml-8 hidden md:flex items-center"
          >
            <button
              class="btn btn-ghost rounded-full px-2"
              @click="onPrevMonthClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiMenuLeft" :size="24"></SvgIcon>
            </button>
            <button class="btn btn-ghost rounded-full" @click="onTodayClicked">
              <SvgIcon
                icon-set="mdi"
                :path="mdiCalendarToday"
                :size="24"
              ></SvgIcon>
              {{ la.t(".nav.today") }}
            </button>
            <button
              class="btn btn-ghost rounded-full px-2"
              @click="onNextMonthClicked"
            >
              <SvgIcon icon-set="mdi" :path="mdiMenuRight" :size="24"></SvgIcon>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <div
      v-if="props.isMenuHideBtnEnabled !== false"
      class="absolute bottom-3 right-3 w-fit rounded-full"
      :class="isMenuShown ? '' : 'backdrop-blur-sm bg-base-100/80'"
    >
      <div class="indicator">
        <span
          v-if="inHotkeyMode"
          class="indicator-item indicator-bottom indicator-start ml-2 mb-2 hotkey-mark"
          >t</span
        >
        <button
          class="btn btn-circle btn-ghost rounded-full"
          @click="toggleContentMenuBtnClicked"
        >
          <SvgIcon
            class="text-base-content"
            icon-set="mdi"
            :path="mdiMenuOpen"
            :size="24"
            :flip="isMenuShown ? 'h' : 'none'"
          ></SvgIcon>
        </button>
      </div>
    </div>
    <div v-else class="absolute bottom-3 right-3 w-12 h-12"></div>
  </div>
</template>

<style scoped>
.menu-open-enter-active,
.menu-open-leave-active {
  transition: all 0.3s ease;
}
.menu-open-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.menu-open-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
