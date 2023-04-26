<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import {
  mdiCheck,
  mdiClose,
  mdiCloseCircle,
  mdiPound,
  mdiArrowLeftBottom,
  mdiDeleteForever,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON, TagValue } from "~/dwdy/feature/tag/def";
import { listCandidateTags, normalizeTag } from "~/dwdy/feature/tag/action";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import ShlPanel from "~/components/panels/StringHighlightPanel.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string[]): void;
}>();

const MODAL_ID = "diary-search-feature-tag-modal";
const la = new LocaleActor("dwdy.feature.sticker");
const dwdyState = useDwdyState();
const searchState = useSearchState();
const isModalOn = ref(false);

const currentTags = ref<TagValue[]>([]);
const storedTags = ref<TagValue[]>([]);
const markedTag = ref<TagValue>("");
const keyword = ref<string>("");
const tagInput = ref();

fetchStoredTags();

watch(
  () => [dwdyState.diary.value],
  () => {
    fetchStoredTags();
  }
);

const filteredTags = computed<TagValue[]>(() => {
  let tags = [...storedTags.value];
  if (currentTags.value.length > 0) {
    tags = tags.filter((tag) => {
      return !currentTags.value.includes(tag);
    });
  }
  if (keyword.value) {
    tags = tags.filter((tag) => {
      return tag.toLowerCase().includes(keyword.value.toLowerCase());
    });
  }
  return tags;
});

const isTagFound = computed<boolean>(() => {
  return markedTag.value !== "";
});

async function fetchStoredTags(): Promise<void> {
  storedTags.value = await listCandidateTags();
}

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
    if (newValue) {
      currentTags.value = [...(searchState.query.value.feature.tag || [])];
      nextTick(() => {
        if (tagInput.value) {
          tagInput.value.focus();
        }
      });
    }
  }
);

watch(
  () => isModalOn.value,
  () => {
    emit("update:modelValue", isModalOn.value);
  }
);

function onTagAdded(tag: TagValue): void {
  const normalizedTag = normalizeTag(tag);
  const foundIndex = currentTags.value.indexOf(normalizedTag);
  if (foundIndex > 0) {
    currentTags.value.splice(
      currentTags.value.length - 1,
      0,
      currentTags.value.splice(foundIndex, 1)[0]
    );
  } else {
    currentTags.value.push(normalizedTag);
  }
}

function onTagDeleted(index: number): void {
  currentTags.value.splice(index, 1);
}

function onTagInputEnterPressed(): void {
  if (markedTag.value !== "") {
    onTagAdded(markedTag.value);
    markedTag.value = "";
    keyword.value = "";
  }
}

function onTagInputTyped(): void {
  nextTick(() => {
    keyword.value = normalizeTag(keyword.value);
    markedTag.value = filteredTags.value[0] || "";
  });
}

function onTagInputMoved(event: KeyboardEvent, direction: "up" | "down"): void {
  const selectedIndex = filteredTags.value.indexOf(markedTag.value);
  if (selectedIndex < 0) {
    markedTag.value = filteredTags.value[0];
  } else if (direction === "up") {
    if (selectedIndex === 0) {
      markedTag.value = filteredTags.value[filteredTags.value.length - 1];
    } else {
      markedTag.value = filteredTags.value[selectedIndex - 1];
    }
  } else if (direction === "down") {
    if (selectedIndex === filteredTags.value.length - 1) {
      markedTag.value = filteredTags.value[0];
    } else {
      markedTag.value = filteredTags.value[selectedIndex + 1];
    }
  }
  event.stopPropagation();
}

function clearAllTags(): void {
  currentTags.value = [];
}

function onApplyBtnClicked(): void {
  searchState.query.value.feature.tag = [...currentTags.value];
  isModalOn.value = false;
}
</script>
<template>
  <ModalBase
    ref="dateSelectorModel"
    v-model="isModalOn"
    class="fixed z-10 modal-w-3xl"
    :modal-base-id="MODAL_ID"
  >
    <template #modal-title>
      <h2 class="card-title mb-2">
        <SvgIcon
          :icon-set="FEATURE_ICON['main'].set"
          :path="FEATURE_ICON['main'].path"
          :size="24"
        ></SvgIcon>
        {{ featureText(DiaryFeature.Tag, la) }}
      </h2>
    </template>
    <template #modal-fixed-bottom-panel>
      <div class="w-full flex items-stretch">
        <div
          class="w-full rounded border-2 border-dashed border-base-300 p-3 flex justify-start items-start flex-wrap"
        >
          <div v-for="(value, index) in currentTags" :key="index">
            <div
              class="w-fit mr-2 mb-2 text-primary bg-base-100 p-1 border border-base-content rounded shadow flex justify-start items-center"
            >
              <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
              <div class="ml-1 mr-2">{{ value }}</div>
              <button
                class="py-1 text-base-200 cursor-pointer"
                @click="onTagDeleted(index)"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiCloseCircle"
                  :size="16"
                ></SvgIcon>
              </button>
            </div>
          </div>
          <div
            class="w-fit text-primary bg-base-100 p-2 pl-1 border border-base-content rounded shadow flex justify-start items-center"
          >
            <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
            <label class="w-48 input-group">
              <input
                ref="tagInput"
                v-model="keyword"
                class="ml-1 input input-bordered border-base-200 w-full"
                type="text"
                name="fileName"
                autocomplete="off"
                @input="onTagInputTyped"
                @keyup.up="onTagInputMoved($event, 'up')"
                @keyup.down="onTagInputMoved($event, 'down')"
                @keyup.enter="onTagInputEnterPressed"
              />
              <span
                v-if="isTagFound"
                class="bg-base-200 px-2 cursor-pointer"
                @click="onTagInputEnterPressed"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiArrowLeftBottom"
                  :size="20"
                ></SvgIcon>
              </span>
            </label>
          </div>
        </div>
        <div v-if="currentTags.length > 0" class="flex-none m-3">
          <button
            class="btn btn-ghost flex h-full text-error"
            @click="clearAllTags"
          >
            <SvgIcon
              icon-set="mdi"
              :path="mdiDeleteForever"
              :size="24"
            ></SvgIcon>
          </button>
        </div>
      </div>
      <div class="card-actions mt-2 items-center">
        <div class="grow flex items-center">
          <button class="btn btn-primary" @click="onApplyBtnClicked">
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiCheck"
              :size="16"
            ></SvgIcon>
            {{ la.t("app.action.apply") }}
          </button>
          <button class="btn btn-ghost ml-2" @click="isModalOn = false">
            <SvgIcon
              class="text-base-content mr-2"
              icon-set="mdi"
              :path="mdiClose"
              :size="16"
            ></SvgIcon>
            {{ la.t("app.action.cancel") }}
          </button>
        </div>
      </div>
    </template>
    <template #modal-content>
      <div c class="w-full max-h-v30 p-3 flex flex-col">
        <div
          class="min-w-0 flex-1 overflow-x-auto flex flex-col justify-start items-start flex-wrap"
        >
          <div v-for="(value, index) in filteredTags" :key="index">
            <div
              class="w-fit mr-2 mb-2 p-1 text-primary bg-base-100 cursor-pointer flex justify-start items-center"
              :class="{ 'border-2 border-base-200': markedTag === value }"
              @click="onTagAdded(value)"
            >
              <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
              <div class="mx-1">
                <ShlPanel :target="value" :keyword="keyword"></ShlPanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
