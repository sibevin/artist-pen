<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { SelectionOption } from "~/models/app/types";
import { useAppState } from "~/states/useAppState";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";

interface Props {
  modalId: string;
  currentValue: string;
  options: SelectionOption[];
  modelValue: boolean;
  iconEnabled?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
}>();

const appState = useAppState();

const pn = ref<PageNavigator>(new PageNavigator([]));
appState.hk.value.registerPageNavigatorKeys(
  pn.value as PageNavigator,
  props.modalId
);

const currentValue = ref<string>();
const isModalOn = ref(false);
const selectorModel = ref();
appState.hk.value.registerKey({
  keys: ["x"],
  scope: props.modalId,
  callback: () => {
    closeModal();
  },
});
const DIGITS = [...Array(10).keys()].map((num) => String(num));
appState.hk.value.registerKey({
  keys: DIGITS,
  scope: props.modalId,
  callback: ({ event }) => {
    if (props.options[Number(event.key)]) {
      onSelected(props.options[Number(event.key)].value);
    }
  },
});

onMounted(() => {
  currentValue.value = props.currentValue;
  isModalOn.value = props.modelValue;
  updatePnCellSpec();
  pn.value.resetCurrent();
});

watch(
  () => props.currentValue,
  (newValue) => {
    currentValue.value = newValue;
    updatePnFirstWithCurrentValue();
    pn.value.resetCurrent();
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
    updatePnFirstWithCurrentValue();
    pn.value.resetCurrent();
  }
);

function updatePnCellSpec(): void {
  const navCellSpecs: NavCellSpec[] = [];
  props.options.forEach((option, index) => {
    navCellSpecs.push({
      cell: { name: `option-${option.value}`, start: [0, index] },
      callback: {
        trigger: () => {
          onSelected(option.value);
        },
      },
    });
  });
  navCellSpecs.push({
    cell: { name: "modal-close-btn", start: [0, props.options.length] },
    callback: {
      trigger: () => {
        closeModal();
      },
    },
  });
  pn.value.resetCellSpec(navCellSpecs);
  updatePnFirstWithCurrentValue();
}

function updatePnFirstWithCurrentValue(): void {
  pn.value.resetFirst(`option-${currentValue.value}`);
}

function closeModal() {
  isModalOn.value = false;
}

function onSelected(value: string) {
  closeModal();
  if (currentValue.value !== value) {
    currentValue.value = value;
    emit("change", currentValue.value);
  }
}

function triggerModelUpdate() {
  if (isModalOn.value) {
    appState.hk.value.switchScope(props.modalId);
  } else {
    appState.hk.value.switchBackScope();
  }
  if (selectorModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}
</script>
<template>
  <ModalBase
    ref="selectorModel"
    v-model="isModalOn"
    class="fixed z-10"
    :modal-base-id="props.modalId"
    :outside-close-enabled="true"
    :current-selected-btn="pn.isCurrent('modal-close-btn') ? 'close' : ''"
    :show-hotkey-hint="appState.hk.value.isMarkShown(props.modalId)"
  >
    <template #modal-title>
      <slot name="modal-title"></slot>
    </template>
    <template #modal-content>
      <div class="mt-2 overflow-y-auto">
        <ul class="menu bg-base-100">
          <li
            v-for="(option, index) in options"
            :key="option.value"
            :class="{
              bordered: option.value === currentValue,
            }"
          >
            <button
              class="flex justify-between items-center"
              :class="
                pn.isCurrent(`option-${option.value}`) ? 'bg-base-200' : ''
              "
              @click="onSelected(option.value)"
            >
              <SvgIcon
                v-if="option.icon && props.iconEnabled"
                :icon-set="option.icon.set"
                :path="option.icon.path"
                :size="24"
              ></SvgIcon>
              <div>
                {{ option.label }}
              </div>
              <div class="flex-1"></div>
              <div
                v-if="
                  appState.hk.value.isMarkShown(props.modalId) &&
                  options.length <= 10
                "
              >
                <div class="hotkey-mark mx-2">{{ index }}</div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </template>
  </ModalBase>
</template>
