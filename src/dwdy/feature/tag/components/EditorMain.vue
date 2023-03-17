<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { mdiCloseCircle, mdiPound, mdiArrowLeftBottom } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { TagValue } from "~/dwdy/feature/tag/def";
import {
  addTag,
  deleteTag,
  listCandidateTags,
  normalizeTag,
} from "~/dwdy/feature/tag/action";
import SvgIcon from "~/components/SvgIcon.vue";
import ShlPanel from "~/components/panels/StringHighlightPanel.vue";

const dwdyState = useDwdyState();
const currentTags = ref<TagValue[]>([]);
const storedTags = ref<TagValue[]>([]);
const editingTag = ref<TagValue>("");
const selectedTag = ref<TagValue>("");
const isEditingTagEmpty = ref(true);

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
  if (editingTag.value) {
    tags = tags.filter((tag) => {
      return tag.toLowerCase().includes(editingTag.value.toLowerCase());
    });
  }
  return tags;
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
  if (selectedTag.value !== "") {
    await onTagAdded(selectedTag.value);
  } else {
    await onTagAdded(editingTag.value);
  }
  selectedTag.value = "";
  editingTag.value = "";
}

function onTagInputTyped(): void {
  nextTick(() => {
    selectedTag.value = "";
    editingTag.value = normalizeTag(editingTag.value);
  });
}

function onTagInputMoved(direction: "up" | "down"): void {
  const selectedIndex = filteredTags.value.indexOf(selectedTag.value);
  if (selectedIndex < 0) {
    selectedTag.value = filteredTags.value[0];
  } else if (direction === "up") {
    if (selectedIndex === 0) {
      selectedTag.value = filteredTags.value[filteredTags.value.length - 1];
    } else {
      selectedTag.value = filteredTags.value[selectedIndex - 1];
    }
  } else if (direction === "down") {
    if (selectedIndex === filteredTags.value.length - 1) {
      selectedTag.value = filteredTags.value[0];
    } else {
      selectedTag.value = filteredTags.value[selectedIndex + 1];
    }
  }
}

async function onTagInputBackspacePressed(): Promise<void> {
  if (editingTag.value !== "") {
    isEditingTagEmpty.value = false;
    return;
  }
  if (!isEditingTagEmpty.value) {
    isEditingTagEmpty.value = true;
    return;
  }
  isEditingTagEmpty.value = false;
  const lastIndex = currentTags.value.length - 1;
  if (lastIndex >= 0) {
    editingTag.value = currentTags.value[lastIndex];
    await onTagDeleted(lastIndex);
  }
}
</script>
<template>
  <div class="w-full h-full p-3 flex flex-col">
    <div
      class="flex-none rounded border-2 border-dashed border-base-300 p-3 flex justify-start items-start flex-wrap"
    >
      <div v-for="(value, index) in currentTags" :key="index">
        <div
          class="w-fit mr-2 mb-2 text-primary bg-base-100 p-1 border border-base-content rounded shadow flex justify-start items-center"
        >
          <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
          <div class="mx-1">{{ value }}</div>
          <div
            class="pl-2 py-1 text-base-200 cursor-pointer"
            @click="onTagDeleted(index)"
          >
            <SvgIcon icon-set="mdi" :path="mdiCloseCircle" :size="16"></SvgIcon>
          </div>
        </div>
      </div>
      <div
        class="w-fit text-primary bg-base-100 p-2 pl-1 border border-base-content rounded shadow flex justify-start items-center"
      >
        <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
        <label class="w-48 input-group">
          <input
            ref="tagInput"
            v-model="editingTag"
            class="ml-1 input input-bordered border-base-200 w-full"
            type="text"
            name="fileName"
            @input="onTagInputTyped"
            @keyup.up="onTagInputMoved('up')"
            @keyup.down="onTagInputMoved('down')"
            @keyup.enter="onTagInputEnterPressed"
            @keyup.delete="onTagInputBackspacePressed"
          />
          <span class="bg-base-200 px-2">
            <SvgIcon
              icon-set="mdi"
              :path="mdiArrowLeftBottom"
              :size="20"
            ></SvgIcon>
          </span>
        </label>
      </div>
    </div>
    <div
      class="min-w-0 pt-2 flex-1 overflow-x-auto flex flex-col justify-start items-start flex-wrap"
    >
      <div v-for="(value, index) in filteredTags" :key="index">
        <div
          class="w-fit mr-2 mb-2 p-1 text-primary bg-base-100 cursor-pointer flex justify-start items-center"
          :class="{ 'border-2 border-base-200': selectedTag === value }"
          @click="onTagAdded(value)"
        >
          <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
          <div class="mx-1">
            <ShlPanel :target="value" :keyword="editingTag"></ShlPanel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
