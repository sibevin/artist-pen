<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { mdiPlus, mdiFileEditOutline } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon, featureText } from "~/dwdy/feature/map";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", value: { feature: DiaryFeature }): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("app.action");

const isModalOn = ref(false);
const diaryEditorSelectorModel = ref();

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

function triggerModelUpdate() {
  if (diaryEditorSelectorModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}
function onContentEditorOpen(feature: DiaryFeature): void {
  emit("select", { feature });
  isModalOn.value = false;
}
</script>
<template>
  <ModalBase
    ref="diaryEditorSelectorModel"
    v-model="isModalOn"
    class="fixed z-10"
    modal-base-id="diary-editor-selector"
  >
    <template #modal-title>
      <div>
        <h2 class="card-title mb-2">
          <SvgIcon
            class="text-base-content mr-1"
            icon-set="mdi"
            :path="mdiFileEditOutline"
            :size="24"
          ></SvgIcon>
          {{ la.t(".edit") }}
        </h2>
      </div>
    </template>
    <template #modal-content>
      <div class="card-actions mt-3 items-center">
        <div class="w-full flex flex-col items-stretch">
          <button
            v-for="feature in dwdyState.diary.value.enabledFeatures"
            :key="feature"
            class="w-full mb-2 p-4 rounded border-2 border-base-200 flex justify-center items-center"
            :class="
              dwdyState.entry.value.hasContent(feature) ? '' : 'border-dashed'
            "
            @click="onContentEditorOpen(feature)"
          >
            <SvgIcon
              class="mr-3 text-base-200"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="32"
            ></SvgIcon>
            <div class="indicator">
              <div class="flex items-center text-primary">
                {{ featureText(feature, la) }}
                <SvgIcon
                  v-if="!dwdyState.entry.value.hasContent(feature)"
                  class="ml-2"
                  icon-set="mdi"
                  :path="mdiPlus"
                  :size="16"
                ></SvgIcon>
              </div>
            </div>
          </button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
