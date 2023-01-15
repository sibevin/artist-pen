<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { mdiFileEditOutline, mdiClose } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { featureComponent } from "~/models/dwdy/featureDef";
import YmdNavPanel from "~/components/dwdy/common/YmdNavPanel.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";

const props = defineProps({
  currentSelectedBtn: {
    type: String,
    default: undefined,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
  (e: "openContentEditor", action: string): void;
}>();

const la = new LocaleActor("app");
const dwdyState = useDwdyState();
const isModalOn = ref(false);
const diaryContentFullViewerModal = ref();
const contentFullViewer = ref();

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
  emit("openContentEditor", "update");
}

function openModal() {
  if (dwdyState.editingContent.value.index < 0) {
    dwdyState.editingContent.value.index = 0;
  }
  if (contentFullViewer.value && contentFullViewer.value.setCurrentIndex) {
    contentFullViewer.value.setCurrentIndex(
      dwdyState.editingContent.value.index
    );
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
        class="w-full pt-3 flex items-center backdrop-blur-sm bg-base-100/60"
      >
        <YmdNavPanel
          v-if="dwdyState.diary.value.isTimeBasedLayout"
          :current-date="dwdyState.entry.value.dIndexDate || new Date()"
        ></YmdNavPanel>
        <div class="grow"></div>
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
      <div class="absolute inset-6">
        <component
          :is="
            featureComponent(
              dwdyState.editingContent.value.feature,
              'fullViewer'
            )
          "
          ref="contentFullViewer"
          :content-index="dwdyState.editingContent.value.index"
        ></component>
      </div>
    </template>
  </ModalBase>
</template>
