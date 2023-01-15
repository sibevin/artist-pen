<script setup lang="ts">
import { ref, watch } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { FeatureMeta } from "~/models/dwdy/feature/text/index";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

const dwdyState = useDwdyState();
const textContent = ref<FeatureMeta>();

fetchText();

watch(
  () => [props.contentIndex, dwdyState.entry.value],
  () => {
    fetchText();
  }
);

async function fetchText(): Promise<void> {
  textContent.value = dwdyState.entry.value.fetchContent<DiaryFeature.Text>(
    DiaryFeature.Text,
    props.contentIndex
  );
}
</script>
<template>
  <div
    class="mb-2 h-24 overflow-hidden text-ellipsis relative"
    :class="dwdyState.config.value.textFontStyle()"
  >
    <div v-html="textContent && textContent.raw"></div>
    <div
      class="absolute bottom-0 right-0 h-6 w-32 bg-gradient-to-r from-transparent to-base-100"
    ></div>
  </div>
</template>
