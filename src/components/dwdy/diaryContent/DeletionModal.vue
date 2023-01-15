<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { mdiClose, mdiDeleteForever, mdiDotsCircle } from "@mdi/js";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { featureFlow, featureComponent } from "~/models/dwdy/featureDef";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "done"): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("components.dwdy.diaryContent.DeletionModal");

const isModalOn = ref(false);
const diaryContentDeletionModel = ref();
const selectedIndexes = ref<number[]>([]);
const currentContentSize = ref<number>(0);
const isInDeleting = ref(false);
const cdmItems = ref();

const isAllSelected = computed<boolean>(() => {
  return currentContentSize.value === selectedIndexes.value.length;
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
  () => [dwdyState.editingContent.value.index],
  () => {
    selectedIndexes.value = [dwdyState.editingContent.value.index];
  }
);

function initList(): void {
  isInDeleting.value = false;
  currentContentSize.value = dwdyState.entry.value.fetchContents(
    dwdyState.editingContent.value.feature
  ).length;
  if (dwdyState.editingContent.value.index != undefined) {
    selectedIndexes.value = [dwdyState.editingContent.value.index];
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
    selectedIndexes.value = [...Array(currentContentSize.value).keys()];
  }
}

async function onDeletionConfirmed(): Promise<void> {
  isInDeleting.value = true;
  const flow = featureFlow(dwdyState.editingContent.value.feature);
  const indexToDelete = selectedIndexes.value.sort((a, b) => {
    return b - a;
  });
  for (let index of indexToDelete) {
    if (flow.deletion.delete) {
      await flow.deletion.delete(index);
    } else {
      dwdyState.entry.value.deleteContent(
        dwdyState.editingContent.value.feature,
        index
      );
      await dwdyState.entry.value.save();
      dwdyState.updateEntryBunch(dwdyState.entry.value.doc);
    }
  }
  isInDeleting.value = false;
  isModalOn.value = false;
  emit("done");
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
        v-if="currentContentSize > 1 && !isInDeleting"
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
        v-for="index in [...Array(currentContentSize).keys()]"
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
          :is="
            featureComponent(
              dwdyState.editingContent.value.feature,
              'listEntry'
            )
          "
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
