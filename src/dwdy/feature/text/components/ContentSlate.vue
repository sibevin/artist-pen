<script setup lang="ts">
import { ref, watch } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureMeta } from "~/dwdy/feature/text/def";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
  enableTextSelect: {
    type: Boolean,
    default: false,
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

function textStyle(): string {
  let styleStr = dwdyState.config.value.textFontStyle();
  if (props.enableTextSelect) {
    styleStr = `${styleStr} select-text`;
  }
  return styleStr;
}

async function fetchText(): Promise<void> {
  textContent.value = dwdyState.entry.value.fetchContent<DiaryFeature.Text>(
    DiaryFeature.Text,
    props.contentIndex
  );
}
</script>
<template>
  <p
    class="text-left"
    :class="textStyle()"
    v-html="textContent && textContent.html"
  ></p>
</template>
