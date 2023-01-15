<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { mdiClose } from "@mdi/js";
import { ionHelpSharp } from "~/services/iconSetPath";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  modalBaseId: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  outsideCloseEnabled: {
    type: Boolean,
    default: false,
  },
  helpBtnEnabled: {
    type: Boolean,
    default: false,
  },
  closeBtnEnabled: {
    type: Boolean,
    default: true,
  },
  currentSelectedBtn: {
    type: String,
    default: undefined,
  },
  showHotkeyHint: {
    type: Boolean,
    default: false,
  },
});

const isModalOn = ref(false);
const baseModal = ref();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "triggerHelp"): void;
}>();

onMounted(() => {
  isModalOn.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
  }
);

const modalId = computed(() => {
  return "modal-base_" + props.modalBaseId;
});

const outsideFor = computed(() => {
  return props.outsideCloseEnabled
    ? modalId.value
    : "modal-base_disabled_outside_close";
});

function triggerModelUpdate() {
  if (baseModal.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onModalToggleChanged() {
  isModalOn.value = baseModal.value.checked;
  triggerModelUpdate();
}

function onHelpBtnClicked() {
  emit("triggerHelp");
}
</script>
<template>
  <div>
    <input
      :id="modalId"
      ref="baseModal"
      type="checkbox"
      class="modal-toggle"
      :checked="isModalOn"
      @change="onModalToggleChanged"
    />
    <label class="modal modal-bottom" :for="outsideFor">
      <div class="max-w-full md:max-w-lg modal-box card p-0">
        <div
          class="max-h-v90 card-body p-3 flex flex-col justify-between items-start overflow-hidden"
        >
          <div class="pt-2">
            <slot name="modal-title"></slot>
          </div>
          <slot name="modal-fixed-top-panel"></slot>
          <div class="flex-1 w-full overflow-y-auto">
            <slot name="modal-content"></slot>
          </div>
          <slot name="modal-fixed-bottom-panel"></slot>
          <div class="absolute top-0 right-0 p-2 flex items-center">
            <div v-if="props.helpBtnEnabled" class="indicator">
              <span
                v-if="props.showHotkeyHint"
                class="indicator-item indicator-bottom indicator-start ml-2 mb-2 hotkey-mark"
                >i</span
              >
              <button
                class="btn btn-circle btn-ghost"
                :class="
                  props.currentSelectedBtn === 'help' ? 'bg-base-200' : ''
                "
                @click="onHelpBtnClicked"
              >
                <SvgIcon
                  class="text-base-content"
                  icon-set="ion"
                  :path="ionHelpSharp"
                  :size="24"
                ></SvgIcon>
              </button>
            </div>
            <div v-if="props.closeBtnEnabled" class="indicator">
              <span
                v-if="props.showHotkeyHint"
                class="indicator-item indicator-bottom indicator-start ml-2 mb-2 hotkey-mark"
                >x</span
              >
              <label
                :for="modalId"
                class="btn btn-circle btn-ghost"
                :class="
                  props.currentSelectedBtn === 'close' ? 'bg-base-200' : ''
                "
              >
                <SvgIcon
                  class="text-base-content"
                  icon-set="mdi"
                  :path="mdiClose"
                  :size="24"
                ></SvgIcon>
              </label>
            </div>
          </div>
        </div>
      </div>
    </label>
  </div>
</template>
