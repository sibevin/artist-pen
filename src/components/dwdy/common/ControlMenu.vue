<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mdiMenu, mdiMenuOpen } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";

interface Props {
  isMenuHideBtnEnabled: boolean;
  currentSelectedBtn?: string;
  hotkeyScope: string;
}
const props = defineProps<Props>();
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

appState.hk.value.registerKey({
  keys: ["t"],
  scope: props.hotkeyScope,
  callback: () => {
    toggleMenu();
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

async function toggleMenu(): Promise<void> {
  isMenuShown.value = !isMenuShown.value;
  dwdyState.config.value.assign({
    isContentMenuShown: isMenuShown.value,
  });
  await dwdyState.config.value.save();
}
defineExpose({ toggleMenu });
</script>
<template>
  <div class="relative">
    <Transition name="menu-open">
      <div
        v-if="isMenuOpen"
        class="w-full border border-base-200/60 backdrop-blur-sm bg-base-100/60 flex flex-col items-stretch"
      >
        <div class="flex justify-center items-center pt-2">
          <slot name="sub-btn-list"></slot>
        </div>
        <div class="flex justify-between items-center p-2 pt-0 pr-14">
          <div class="indicator">
            <span
              v-if="inHotkeyMode"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >m</span
            >
            <label
              for="whole-drawer"
              class="btn btn-circle btn-ghost rounded-full"
              :class="
                props.currentSelectedBtn === 'menu-bars' ? 'bg-base-200' : ''
              "
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
            <slot name="main-btn-list"></slot>
          </div>
        </div>
      </div>
    </Transition>
    <div
      v-if="props.isMenuHideBtnEnabled !== false"
      class="absolute bottom-2 right-2 w-fit rounded-full"
      :class="isMenuShown ? '' : 'backdrop-blur-sm bg-base-100/60'"
    >
      <div class="indicator">
        <span
          v-if="inHotkeyMode"
          class="indicator-item indicator-bottom indicator-start ml-2 mb-2 hotkey-mark"
          >t</span
        >
        <button
          class="btn btn-circle btn-ghost rounded-full"
          :class="props.currentSelectedBtn === 'menu-hide' ? 'bg-base-200' : ''"
          @click="toggleMenu"
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
    <div v-else class="absolute bottom-2 right-2 w-12 h-12"></div>
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
