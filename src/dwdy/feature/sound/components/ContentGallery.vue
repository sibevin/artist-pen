<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { DiaryContentFeatureIndex } from "~/types/dwdy/core";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  FeatureConfig,
  FeatureMeta,
  SoundSource,
} from "~/dwdy/feature/sound/def";
import { buildSoundSources } from "~/dwdy/feature/sound/action";
import { useDwdyState } from "~/states/useDwdyState";
import { useWorkerState } from "~/states/useWorkerState";
import AudioPlayer from "~/dwdy/feature/sound/components/AudioPlayer.vue";
import { DUid } from "~/types/dwdy/core";

const emit = defineEmits<{
  (e: "openFeatureEditor", params: DiaryContentFeatureIndex): void;
}>();

const dwdyState = useDwdyState();
const workerState = useWorkerState();
const soundContents = ref<FeatureMeta[]>([]);
const soundSources = ref<SoundSource[]>([]);

const soundConfig = computed<FeatureConfig>(() => {
  return dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Sound);
});

fetchSoundTracks();

watch(
  () => [dwdyState.entry.value],
  () => {
    fetchSoundTracks();
  }
);

async function fetchSoundTracks(): Promise<void> {
  soundContents.value = dwdyState.entry.value.fetchContents<DiaryFeature.Sound>(
    DiaryFeature.Sound
  );
  soundSources.value = [];
  if (soundContents.value.length === 0) {
    return;
  }
  if (!dwdyState.entry.value.doc.dUid || !dwdyState.entry.value.doc.dIndex) {
    return;
  }
  const daMap = await workerState.attachment.loadAttachmentMap({
    dUid: dwdyState.entry.value.doc.dUid,
    dIndex: dwdyState.entry.value.doc.dIndex,
    daUids: soundContents.value.map((content) => content.daUid) as DUid[],
  });
  soundSources.value = buildSoundSources(soundContents.value, daMap);
}

async function onConfigUpdated(
  givenConfig: Partial<FeatureConfig>
): Promise<void> {
  dwdyState.diary.value.patchFeatureConfig(DiaryFeature.Sound, givenConfig);
  await dwdyState.diary.value.save();
}

function onEditorTriggered(): void {
  nextTick(() => {
    emit("openFeatureEditor", { feature: DiaryFeature.Sound });
  });
}
</script>
<template>
  <AudioPlayer
    v-if="soundSources.length > 0"
    :sound-sources="soundSources"
    :config="soundConfig"
    @update-config="onConfigUpdated"
    @trigger-editor="onEditorTriggered"
  ></AudioPlayer>
</template>
