<script setup lang="ts">
import { ref, watch, computed, onMounted, PropType } from "vue";
import { mdiShuffle } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { SelectionOption } from "~/models/app/types";
import ModalSelector from "~/components/ModalSelector.vue";

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
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "done", index: number): void;
}>();

const positionOptions = computed<SelectionOption[]>(() => {
  if (props.contentCount > 1) {
    return [...Array(props.contentCount).keys()].map((index) => {
      return { label: String(index + 1), value: String(index) };
    });
  } else {
    return [];
  }
});

const dwdyState = useDwdyState();
const la = new LocaleActor("app");
const isModalOn = ref(false);
const diaryEditorPositionChangeModel = ref();

onMounted(() => {
  isModalOn.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
    dwdyState.entry.value.reload();
  }
);

watch(
  () => isModalOn.value,
  () => {
    triggerModelUpdate();
  }
);

function triggerModelUpdate(): void {
  if (diaryEditorPositionChangeModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

async function onContentPositionChanged(newPos: string): Promise<void> {
  const newIndex = parseInt(newPos);
  dwdyState.entry.value.moveContent(
    props.feature,
    props.contentIndex,
    newIndex
  );
  await dwdyState.entry.value.save();
  dwdyState.updateEntry(dwdyState.entry.value.doc);
  emit("done", newIndex);
}
</script>
<template>
  <ModalSelector
    ref="diaryEditorPositionChangeModel"
    v-model="isModalOn"
    modal-id="editor-postion-change"
    :current-value="String(props.contentIndex)"
    :options="positionOptions"
    :icon-enabled="true"
    @change="onContentPositionChanged"
  >
    <template #modal-title>
      <h2 class="card-title mb-4">
        <SvgIcon
          class="mr-1"
          icon-set="mdi"
          :path="mdiShuffle"
          :size="24"
        ></SvgIcon>
        {{ la.t(".action.changeOrder") }}
      </h2>
    </template>
  </ModalSelector>
</template>
