<script setup lang="ts">
import { ref, watch } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureMeta } from "~/dwdy/feature/sound/def";
import { getDurationString } from "~/services/duration";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

const dwdyState = useDwdyState();
const soundMeta = ref<FeatureMeta>();

fetchSound();

watch(
  () => [props.contentIndex, dwdyState.entry.value],
  async () => {
    await fetchSound();
  }
);

async function fetchSound(): Promise<void> {
  if (props.contentIndex < 0) {
    soundMeta.value = undefined;
    return;
  }
  soundMeta.value = dwdyState.entry.value.fetchContent<DiaryFeature.Sound>(
    DiaryFeature.Sound,
    props.contentIndex
  );
  if (!soundMeta.value) {
    return;
  }
}
</script>
<template>
  <div v-if="soundMeta" class="mb-4">
    {{ getDurationString(soundMeta.duration / 1000) }}
  </div>
</template>
