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
  <p
    class="text-left"
    :class="dwdyState.config.value.textFontStyle()"
    v-html="textContent && textContent.html"
  ></p>
</template>
