<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { mdiCog, mdiTuneVariant, mdiTrayFull, mdiLandPlots } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";

import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";
import DiarySettingsGeneralPanel from "~/components/dwdy/diarySettings/GeneralPanel.vue";
import DiarySettingsFeaturePanel from "~/components/dwdy/diarySettings/FeaturePanel.vue";
import DiarySettingsDataPanel from "~/components/dwdy/diarySettings/DataPanel.vue";

interface Props {
  modelValue: boolean;
  fromPageScope: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
}>();

const la = new LocaleActor("pages.dwdy.DiaryPage.settingsModal");
const appState = useAppState();
const isModalOn = ref(false);
const diarySettingsModal = ref();
const modalCurrentSelectedBtn = ref<string>();
const settingsTab = ref<string>("tab-general");
const settingsTabSelected = ref<string>();
const generalPanel = ref();
const featurePanel = ref();
const dataPanel = ref();
const isHotkeyMarkShown = ref(false);

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

function closeModal() {
  isModalOn.value = false;
}

function triggerModelUpdate() {
  if (isModalOn.value) {
    onTabClicked("tab-general");
  } else {
    appState.hk.value.switchScope(props.fromPageScope);
  }
  if (diarySettingsModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onTabClicked(tab: string): void {
  settingsTab.value = tab;
  settingsTabSelected.value = undefined;
  if (tab === "tab-general") {
    appState.hk.value.switchScope("diary-settings-general-panel");
  }
  if (tab === "tab-feature") {
    appState.hk.value.switchScope("diary-settings-feature-panel");
  }
  if (tab === "tab-data") {
    appState.hk.value.switchScope("diary-settings-data-panel");
  }
}

function onPanelActionMoved(action: string | undefined): void {
  if (action === "close") {
    modalCurrentSelectedBtn.value = "close";
  } else {
    modalCurrentSelectedBtn.value = undefined;
    settingsTabSelected.value = action;
  }
}

function onPanelActionTriggered(action: string): void {
  if (action === "close") {
    closeModal();
  } else {
    onTabClicked(action);
  }
}

function onPanelHotkeyMarkToggled(value: boolean): void {
  isHotkeyMarkShown.value = value;
}
</script>

<template>
  <ModalBase
    ref="diarySettingsModal"
    v-model="isModalOn"
    class="fixed z-10 modal-w-3xl"
    modal-base-id="diary-settings-modal"
    :current-selected-btn="modalCurrentSelectedBtn"
    :show-hotkey-hint="isHotkeyMarkShown"
  >
    <template #modal-title>
      <div>
        <h2 class="card-title mb-2">
          <SvgIcon
            class="text-base-content mr-1"
            icon-set="mdi"
            :path="mdiCog"
            :size="24"
          ></SvgIcon>
          {{ la.t("pages.dwdy.DiaryPage.menu.settings") }}
        </h2>
      </div>
    </template>
    <template #modal-fixed-bottom-panel>
      <div
        class="w-full flex justify-between items-center flex-wrap border-t-4 border-base-200"
      >
        <button
          class="flex-1 btn btn-ghost rounded-none"
          :class="{
            'bg-base-200': settingsTab === 'tab-general',
            'border-base-200':
              settingsTab !== 'tab-general' &&
              settingsTabSelected !== 'tab-general',
            'border-primary border-4': settingsTabSelected === 'tab-general',
          }"
          @click="onTabClicked('tab-general')"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiTuneVariant"
            :size="16"
          ></SvgIcon>
          {{ la.t(".tab.general") }}
          <span v-if="isHotkeyMarkShown" class="ml-3 hotkey-mark">7</span>
        </button>
        <button
          class="flex-1 btn btn-ghost rounded-none"
          :class="{
            'bg-base-200': settingsTab === 'tab-feature',
            'border-base-200':
              settingsTab !== 'tab-feature' &&
              settingsTabSelected !== 'tab-feature',
            'border-primary border-4': settingsTabSelected === 'tab-feature',
          }"
          @click="onTabClicked('tab-feature')"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiLandPlots"
            :size="16"
          ></SvgIcon>
          {{ la.t(".tab.feature") }}
          <span v-if="isHotkeyMarkShown" class="ml-3 hotkey-mark">8</span>
        </button>
        <button
          class="w-full md:flex-1 btn btn-ghost rounded-none"
          :class="{
            'bg-base-200': settingsTab === 'tab-data',
            'border-base-200':
              settingsTab !== 'tab-data' && settingsTabSelected !== 'tab-data',
            'border-primary border-4': settingsTabSelected === 'tab-data',
          }"
          @click="onTabClicked('tab-data')"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiTrayFull"
            :size="16"
          ></SvgIcon>
          {{ la.t(".tab.data") }}
          <span v-if="isHotkeyMarkShown" class="ml-3 hotkey-mark">9</span>
        </button>
      </div>
    </template>
    <template #modal-content>
      <div v-if="settingsTab === 'tab-general'">
        <DiarySettingsGeneralPanel
          ref="generalPanel"
          @move-action="onPanelActionMoved"
          @trigger-action="onPanelActionTriggered"
          @toggle-hotkey-mark="onPanelHotkeyMarkToggled"
        ></DiarySettingsGeneralPanel>
      </div>
      <div v-if="settingsTab === 'tab-feature'">
        <DiarySettingsFeaturePanel
          ref="featurePanel"
          @move-action="onPanelActionMoved"
          @trigger-action="onPanelActionTriggered"
          @toggle-hotkey-mark="onPanelHotkeyMarkToggled"
        ></DiarySettingsFeaturePanel>
      </div>
      <div v-if="settingsTab === 'tab-data'">
        <DiarySettingsDataPanel
          ref="dataPanel"
          @move-action="onPanelActionMoved"
          @trigger-action="onPanelActionTriggered"
          @toggle-hotkey-mark="onPanelHotkeyMarkToggled"
        ></DiarySettingsDataPanel>
      </div>
    </template>
  </ModalBase>
</template>
