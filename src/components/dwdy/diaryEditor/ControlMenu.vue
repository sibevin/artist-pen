<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { mdiMenu } from "@mdi/js";
import { elRdBook } from "~/services/iconSetPath";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText, featureIcon } from "~/dwdy/feature/map";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  feature: {
    type: String,
    required: true,
  },
  currentSelectedBtn: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "toggleFeatureSelection"): void;
}>();

const router = useRouter();
const dwdyState = useDwdyState();
const appState = useAppState();
const la = new LocaleActor("pages.dwdy.DiaryEditorPage");
const inHotkeyMode = ref(false);

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

function onBackToDiaryBtnClicked() {
  router.push({
    name: "diary",
    params: { uid: dwdyState.diary.value.doc.dUid },
    query: { i: dwdyState.entry.value.doc.dIndex },
  });
}

function onFeatureSelectorToggled(): void {
  emit("toggleFeatureSelection");
}
</script>
<template>
  <div class="relative">
    <div
      class="w-full border-t border-base-200/60 backdrop-blur-sm bg-base-100/60 flex flex-col items-stretch"
    >
      <div class="flex justify-between items-center p-2">
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
          <button
            class="btn btn-ghost rounded-full text-primary flex items-center"
            @click="onFeatureSelectorToggled()"
          >
            <SvgIcon
              :icon-set="featureIcon(props.feature as DiaryFeature).set"
              :path="featureIcon(props.feature as DiaryFeature).path"
              :size="24"
            ></SvgIcon>
            <div class="hidden md:block ml-2">
              {{ featureText(props.feature as DiaryFeature, la) }}
            </div>
          </button>
          <slot name="main-menu"></slot>
        </div>
        <button
          class="btn btn-ghost rounded-full items-center"
          @click="onBackToDiaryBtnClicked()"
        >
          <SvgIcon icon-set="el" :path="elRdBook" :size="24"></SvgIcon>
          <div class="hidden md:block ml-2">
            {{ la.t(".menu.backToDiary") }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
