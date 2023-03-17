<script setup lang="ts">
import { ref, watch } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureMeta } from "~/dwdy/feature/image/def";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

const dwdyState = useDwdyState();
const imageMeta = ref<FeatureMeta>();

fetchImage();

watch(
  () => [props.contentIndex, dwdyState.entry.value],
  async () => {
    await fetchImage();
  }
);

async function fetchImage(): Promise<void> {
  if (props.contentIndex < 0) {
    imageMeta.value = undefined;
    return;
  }
  imageMeta.value = dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    props.contentIndex
  );
  if (!imageMeta.value) {
    return;
  }
}
</script>
<template>
  <div v-if="imageMeta" class="mb-4">
    <img v-if="imageMeta.thumbnail" :src="imageMeta.thumbnail" />
  </div>
</template>
