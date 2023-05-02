<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { mdiFileEditOutline, mdiClose } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { featureComponent } from "~/dwdy/feature/component";
import { layoutComponent } from "~/dwdy/layout/component";
import { DiaryFeature } from "~/dwdy/feature/def";
import { DiaryContentFeatureIndex } from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "openContentEditor", value: { feature: DiaryFeature }): void;
}>();

const la = new LocaleActor("app");
const dwdyState = useDwdyState();
const isModalOn = ref(false);
const diaryContentFullViewerModal = ref();
const contentFullViewer = ref();
const currentCfi = ref<DiaryContentFeatureIndex>({
  feature: DiaryFeature.Text,
});

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

function triggerModelUpdate(): void {
  if (diaryContentFullViewerModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onEditorOpened() {
  isModalOn.value = false;
  emit("openContentEditor", currentCfi.value);
}

function onContentSelected(index: number): void {
  currentCfi.value.index = index;
}

function openModal(cfi: DiaryContentFeatureIndex) {
  currentCfi.value = cfi;
  if (contentFullViewer.value && contentFullViewer.value.setCurrentIndex) {
    contentFullViewer.value.setCurrentIndex(cfi.index || 0);
  }
  isModalOn.value = true;
}
defineExpose({ openModal });
</script>

<template>
  <ModalBase
    ref="diaryContentFullViewerModal"
    v-model="isModalOn"
    class="fixed z-10 modal-full-m-2"
    modal-base-id="diary-content-full-viewer-modal"
    :close-btn-enabled="false"
  >
    <template #modal-fixed-bottom-panel>
      <div
        class="z-10 w-full pt-3 flex items-center backdrop-blur-sm bg-base-100/60"
      >
        <component
          :is="layoutComponent(dwdyState.diary.value.doc.layout, 'titlePanel')"
        ></component>
        <div class="grow flex justify-center items-center">
          <component
            :is="featureComponent(currentCfi.feature, 'fullViewerConfigPanel')"
          ></component>
        </div>
        <button
          class="btn btn-ghost rounded-full flex items-center"
          @click="onEditorOpened"
        >
          <SvgIcon
            icon-set="mdi"
            :path="mdiFileEditOutline"
            :size="24"
          ></SvgIcon>
          <div class="hidden sm:block ml-2">
            {{ la.t(".action.edit") }}
          </div>
        </button>
        <button class="btn btn-circle btn-ghost" @click="isModalOn = false">
          <SvgIcon
            class="text-base-content"
            icon-set="mdi"
            :path="mdiClose"
            :size="24"
          ></SvgIcon>
        </button>
      </div>
    </template>
    <template #modal-content>
      <div class="absolute inset-3">
        <component
          :is="featureComponent(currentCfi.feature, 'fullViewer')"
          ref="contentFullViewer"
          :content-index="currentCfi.index"
          @select="onContentSelected"
        ></component>
      </div>
    </template>
  </ModalBase>
</template>
