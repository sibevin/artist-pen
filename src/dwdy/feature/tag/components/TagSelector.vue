<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
import { mdiPound } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { TagValue } from "~/dwdy/feature/tag/def";
import { listCandidateTags } from "~/dwdy/feature/tag/action";
import SvgIcon from "~/components/SvgIcon.vue";
import ShlPanel from "~/components/panels/StringHighlightPanel.vue";

const props = defineProps({
  currentTags: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  markedTag: {
    type: String,
    default: "",
  },
  keyword: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "select", value: string): void;
}>();

const dwdyState = useDwdyState();
const storedTags = ref<TagValue[]>([]);

fetchStoredTags();

watch(
  () => [dwdyState.diary.value],
  () => {
    fetchStoredTags();
  }
);

const filteredTags = computed<TagValue[]>(() => {
  let tags = [...storedTags.value];
  if (props.currentTags.length > 0) {
    tags = tags.filter((tag) => {
      return !props.currentTags.includes(tag);
    });
  }
  if (props.keyword) {
    tags = tags.filter((tag) => {
      return tag.toLowerCase().includes(props.keyword.toLowerCase());
    });
  }
  return tags;
});

async function fetchStoredTags(): Promise<void> {
  storedTags.value = await listCandidateTags();
}

function onTagSelected(tag: string): void {
  emit("select", tag);
}
</script>
<template>
  <div class="w-full h-full p-3 flex flex-col">
    <div
      class="min-w-0 pt-2 flex-1 overflow-x-auto flex flex-col justify-start items-start flex-wrap"
    >
      <div v-for="(value, index) in filteredTags" :key="index">
        <div
          class="w-fit mr-2 mb-2 p-1 text-primary bg-base-100 cursor-pointer flex justify-start items-center"
          :class="{ 'border-2 border-base-200': props.markedTag === value }"
          @click="onTagSelected(value)"
        >
          <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
          <div class="mx-1">
            <ShlPanel :target="value" :keyword="props.keyword"></ShlPanel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
