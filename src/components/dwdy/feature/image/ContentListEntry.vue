<script setup lang="ts">
import { ref, watch } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { FeatureMeta } from "~/models/dwdy/feature/image/index";

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
    <div class="mb-2">
      {{ imageMeta.fileName }}
    </div>
    <img v-if="imageMeta.thumbnail" :src="imageMeta.thumbnail" />
  </div>
</template>
