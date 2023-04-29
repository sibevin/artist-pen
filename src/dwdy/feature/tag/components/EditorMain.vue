<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import {
  mdiCloseCircle,
  mdiPound,
  mdiArrowLeftBottom,
  mdiDeleteForever,
} from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { TagValue } from "~/dwdy/feature/tag/def";
import {
  addTag,
  deleteTag,
  deleteAllTags,
  listCandidateTags,
  normalizeTag,
} from "~/dwdy/feature/tag/action";
import SvgIcon from "~/components/SvgIcon.vue";
import ShlPanel from "~/components/panels/StringHighlightPanel.vue";

const dwdyState = useDwdyState();
const currentTags = ref<TagValue[]>([]);
const storedTags = ref<TagValue[]>([]);
const keyword = ref<TagValue>("");
const markedTag = ref<TagValue>("");

fetchTags();

watch(
  () => [dwdyState.entry.value],
  () => {
    fetchTags();
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
  return markedTag.value !== "" || keyword.value !== "";
});

async function fetchTags(): Promise<void> {
  currentTags.value = dwdyState.entry.value.fetchContents<DiaryFeature.Tag>(
    DiaryFeature.Tag
  );
  storedTags.value = await listCandidateTags();
}

async function onTagAdded(tag: TagValue): Promise<void> {
  const normalizedTag = normalizeTag(tag);
  if (normalizedTag !== "") {
    const tags = await addTag(normalizedTag);
    currentTags.value = tags;
  }
}

async function onTagDeleted(index: number): Promise<void> {
  const tags = await deleteTag(index);
  currentTags.value = tags;
}

async function onTagInputEnterPressed(): Promise<void> {
  if (markedTag.value !== "") {
    await onTagAdded(markedTag.value);
  } else {
    await onTagAdded(keyword.value);
  }
  markedTag.value = "";
  keyword.value = "";
}

function onTagInputTyped(): void {
  nextTick(() => {
    markedTag.value = "";
    keyword.value = normalizeTag(keyword.value);
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

async function onCleanAllTagsBtnClicked(): Promise<void> {
  await deleteAllTags();
  currentTags.value = [];
}
</script>
<template>
  <div class="w-full h-full p-3 flex flex-col">
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
          @click="onCleanAllTagsBtnClicked"
        >
          <SvgIcon icon-set="mdi" :path="mdiDeleteForever" :size="24"></SvgIcon>
        </button>
      </div>
    </div>
  </div>
</template>
