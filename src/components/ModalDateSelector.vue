<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { mdiCheck, mdiClose } from "@mdi/js";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { useAppState } from "~/states/useAppState";
import { LocaleActor } from "~/services/locale";

const props = defineProps({
  currentDIndex: {
    type: String,
    required: true,
  },
  modalId: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
}>();

const appState = useAppState();
const la = new LocaleActor("pages.dwdy.DiaryPage");

const currentDateStr = ref<string>(dIndexToDateStr(props.currentDIndex));
const isModalOn = ref(false);
const dateSelectorModel = ref();

onMounted(() => {
  currentDateStr.value = dIndexToDateStr(props.currentDIndex);
  isModalOn.value = props.modelValue;
});

watch(
  () => props.currentDIndex,
  (newValue) => {
    currentDateStr.value = dIndexToDateStr(newValue);
  }
);

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

function dIndexToDateStr(dIndex: string): string {
  return `${dIndex.slice(0, 4)}-${dIndex.slice(4, 6)}-${dIndex.slice(6, 8)}`;
}

function dateStrToDIndex(dateStr: string): string {
  return dateStr.replaceAll("-", "");
}

function closeModal() {
  isModalOn.value = false;
}

function onDateUpdated() {
  closeModal();
  emit("change", dateStrToDIndex(currentDateStr.value));
}

function triggerModelUpdate() {
  if (isModalOn.value) {
    appState.hk.value.switchScope(props.modalId);
  } else {
    appState.hk.value.switchBackScope();
  }
  if (dateSelectorModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}
</script>
<template>
  <ModalBase
    ref="dateSelectorModel"
    v-model="isModalOn"
    class="fixed z-10"
    :modal-base-id="props.modalId"
    :show-hotkey-hint="appState.hk.value.isMarkShown(props.modalId)"
  >
    <template #modal-title>
      <slot name="modal-title"></slot>
    </template>
    <template #modal-content>
      <label>
        <input
          v-model="currentDateStr"
          class="input input-bordered border-base-200 w-full"
          type="date"
        />
      </label>
      <div class="card-actions mt-3 items-center">
        <div class="grow flex items-center">
          <button class="btn btn-primary" @click="onDateUpdated">
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiCheck"
              :size="16"
            ></SvgIcon>
            {{ la.t("app.action.update") }}
          </button>
          <label
            class="btn btn-ghost ml-2"
            :for="`modal-base_${props.modalId}`"
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
    </template>
  </ModalBase>
</template>
