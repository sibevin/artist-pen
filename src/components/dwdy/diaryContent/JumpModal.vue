<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import { mdiFormatListBulletedSquare } from "@mdi/js";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { featureIcon, featureComponent } from "~/models/dwdy/featureDef";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "jump", index: number): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("components.dwdy.DiaryContentDeletionModal");

const isModalOn = ref(false);
const diaryContentJumpModel = ref();
const currentContentSize = ref<number>(0);
const cdmItems = ref();

onMounted(() => {
  isModalOn.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
    initList();
  }
);

watch(
  () => isModalOn.value,
  () => {
    triggerModelUpdate();
  }
);

function initList(): void {
  currentContentSize.value = dwdyState.entry.value.fetchContents(
    dwdyState.editingContent.value.feature
  ).length;
  if (dwdyState.editingContent.value.index != undefined) {
    nextTick(() => {
      setTimeout(() => {
        const selectedEle =
          cdmItems.value[dwdyState.editingContent.value.index];
        if (selectedEle && selectedEle.parentElement) {
          const eleBcr = selectedEle.getBoundingClientRect();
          selectedEle.parentElement.scrollBy({
            top:
              eleBcr.top +
              eleBcr.height -
              selectedEle.parentElement.clientHeight +
              72,
            behavior: "smooth",
          });
        }
      }, 100);
    });
  }
}

function triggerModelUpdate(): void {
  if (diaryContentJumpModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onContentSelected(index: number): void {
  isModalOn.value = false;
  emit("jump", index);
}
</script>
<template>
  <ModalBase
    ref="diaryContentJumpModel"
    v-model="isModalOn"
    class="fixed z-10"
    modal-base-id="diary-content-jump"
  >
    <template #modal-title>
      <div>
        <h2 class="card-title mb-2">
          <SvgIcon
            class="mr-1"
            icon-set="mdi"
            :path="mdiFormatListBulletedSquare"
            :size="24"
          ></SvgIcon>
          {{ la.t("app.action.list") }}
        </h2>
      </div>
    </template>
    <template #modal-content>
      <button
        v-for="index in [...Array(currentContentSize).keys()]"
        :key="index"
        ref="cdmItems"
        class="my-2 cursor-pointer flex"
        @click="onContentSelected(index)"
      >
        <div
          class="p-0.5"
          :class="
            index === dwdyState.editingContent.value.index ? 'bg-base-200' : ''
          "
        >
          <SvgIcon
            class="text-base-content flex-none"
            :icon-set="featureIcon(dwdyState.editingContent.value.feature).set"
            :path="featureIcon(dwdyState.editingContent.value.feature).path"
            :size="20"
          ></SvgIcon>
        </div>
        <div class="mx-3 font-bold">
          {{ index + 1 }}
        </div>
        <component
          :is="
            featureComponent(
              dwdyState.editingContent.value.feature,
              'listEntry'
            )
          "
          :content-index="index"
        ></component>
      </button>
    </template>
  </ModalBase>
</template>
