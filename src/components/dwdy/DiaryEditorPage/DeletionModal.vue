<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, PropType } from "vue";
import { mdiClose, mdiDeleteForever, mdiDotsCircle } from "@mdi/js";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { featureFlow } from "~/dwdy/feature/flow";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureComponent } from "~/dwdy/feature/component";

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

const dwdyState = useDwdyState();
const la = new LocaleActor("components.dwdy.diaryContent.DeletionModal");

const isModalOn = ref(false);
const diaryContentDeletionModel = ref();
const selectedIndexes = ref<number[]>([]);
const isInDeleting = ref(false);
const cdmItems = ref();

const isAllSelected = computed<boolean>(() => {
  return props.contentCount === selectedIndexes.value.length;
});

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

watch(
  () => [props.contentIndex],
  () => {
    selectedIndexes.value = props.contentIndex ? [props.contentIndex] : [];
  }
);

function initList(): void {
  isInDeleting.value = false;
  if (props.contentIndex != undefined) {
    selectedIndexes.value = [props.contentIndex];
    nextTick(() => {
      setTimeout(() => {
        if (props.contentIndex != undefined) {
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
        }
      }, 100);
    });
  } else {
    selectedIndexes.value = [];
  }
}

function triggerModelUpdate(): void {
  if (diaryContentDeletionModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function onSelectAllClicked(): void {
  if (isAllSelected.value) {
    selectedIndexes.value = [];
  } else {
    selectedIndexes.value = [...Array(props.contentCount).keys()];
  }
}

function triggerDone(): void {
  let moveToIndex = 0;
  const contentCount = dwdyState.entry.value.fetchContents(
    props.feature
  ).length;
  const lastDeletedIndex =
    selectedIndexes.value[selectedIndexes.value.length - 1];
  if (lastDeletedIndex >= 0 && lastDeletedIndex < contentCount) {
    moveToIndex = lastDeletedIndex;
  } else {
    moveToIndex = contentCount - 1;
  }
  emit("done", moveToIndex);
}

async function onDeletionConfirmed(): Promise<void> {
  isInDeleting.value = true;
  const flow = featureFlow(props.feature);
  const indexToDelete = selectedIndexes.value.sort((a, b) => {
    return b - a;
  });
  for (let index of indexToDelete) {
    if (flow.deleteContent) {
      await flow.deleteContent(dwdyState.entry.value.identity, index);
    } else {
      dwdyState.entry.value.deleteContent(props.feature, index);
      await dwdyState.entry.value.save();
    }
  }
  await dwdyState.reloadEntry();
  isInDeleting.value = false;
  isModalOn.value = false;
  triggerDone();
}
</script>
<template>
  <ModalBase
    ref="diaryContentDeletionModel"
    v-model="isModalOn"
    class="fixed z-10"
    modal-base-id="diary-content-deletion"
  >
    <template #modal-title>
      <div>
        <h2 class="card-title mb-2">
          <SvgIcon
            class="mr-1"
            icon-set="mdi"
            :path="mdiDeleteForever"
            :size="24"
          ></SvgIcon>
          {{ la.t("app.action.delete") }}
        </h2>
      </div>
    </template>
    <template #modal-fixed-top-panel>
      <button
        v-if="props.contentCount > 1 && !isInDeleting"
        class="flex items-center"
        @click="onSelectAllClicked"
      >
        <input
          class="checkbox mr-2 bg-base-100"
          type="checkbox"
          name="highlightedWeekDays"
          :checked="isAllSelected"
        />
        {{ la.t("app.action.selectAll") }}
      </button>
    </template>
    <template #modal-content>
      <label
        v-for="index in [...Array(props.contentCount).keys()]"
        :key="index"
        ref="cdmItems"
        class="my-2 cursor-pointer flex"
        :class="{ hidden: isInDeleting }"
      >
        <input
          v-model.number="selectedIndexes"
          class="checkbox"
          type="checkbox"
          name="highlightedWeekDays"
          :value="index"
        />
        <div class="mx-3 font-bold">{{ index + 1 }}</div>
        <component
          :is="featureComponent(props.feature, 'listEntry')"
          :content-index="index"
        ></component>
      </label>
    </template>
    <template #modal-fixed-bottom-panel>
      <div class="flex">
        <div class="text-error">
          {{ la.t(".deletionHint", { count: selectedIndexes.length }) }}
        </div>
      </div>
      <div class="card-actions mt-2 items-center">
        <div class="grow flex items-center">
          <button
            class="btn btn-error"
            :disabled="selectedIndexes.length === 0 || isInDeleting"
            @click="onDeletionConfirmed"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiDeleteForever"
              :size="16"
            ></SvgIcon>
            {{ la.t("app.action.delete") }}
            <div v-if="isInDeleting">
              <SvgIcon
                class="animate-spin-slow mx-2"
                icon-set="mdi"
                :path="mdiDotsCircle"
                :size="20"
              ></SvgIcon>
            </div>
          </button>
          <label
            class="btn btn-ghost ml-2"
            for="modal-base_diary-content-deletion"
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
