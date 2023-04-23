<script setup lang="ts">
import { ref, watch, onMounted, nextTick, PropType } from "vue";
import { mdiFormatListBulletedSquare } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { featureIcon } from "~/dwdy/feature/map";
import { featureComponent } from "~/dwdy/feature/component";
import { DiaryFeature } from "~/dwdy/feature/def";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  feature: {
    type: String as PropType<DiaryFeature>,
    required: true,
  },
  contentCount: {
    type: Number,
    required: true,
  },
  contentIndex: {
    type: Number,
    default: undefined,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "done", index: number): void;
}>();

const la = new LocaleActor("components.dwdy.diaryEditor.JumpModal");

const isModalOn = ref(false);
const diaryEditorJumpModel = ref();
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
  if (props.contentIndex === undefined) {
    return;
  }
  nextTick(() => {
    setTimeout(() => {
      if (props.contentIndex === undefined) {
        return;
      }
      const selectedEle = cdmItems.value[props.contentIndex];
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

function triggerModelUpdate(): void {
  if (diaryEditorJumpModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onContentSelected(index: number): void {
  isModalOn.value = false;
  emit("done", index);
}
</script>
<template>
  <ModalBase
    ref="diaryEditorJumpModel"
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
        v-for="index in [...Array(props.contentCount).keys()]"
        :key="index"
        ref="cdmItems"
        class="my-2 cursor-pointer flex"
        @click="onContentSelected(index)"
      >
        <div
          class="p-0.5"
          :class="index === props.contentIndex ? 'bg-base-200' : ''"
        >
          <SvgIcon
            class="text-base-content flex-none"
            :icon-set="featureIcon(props.feature).set"
            :path="featureIcon(props.feature).path"
            :size="20"
          ></SvgIcon>
        </div>
        <div class="mx-3 font-bold">
          {{ index + 1 }}
        </div>
        <component
          :is="featureComponent(props.feature, 'listEntry')"
          :content-index="index"
        ></component>
      </button>
    </template>
  </ModalBase>
</template>
