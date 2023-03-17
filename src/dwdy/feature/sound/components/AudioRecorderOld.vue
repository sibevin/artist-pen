<script setup lang="ts">
import { ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import barsScaleMiddle from "@iconify-icons/svg-spinners/bars-scale-middle";
import {
  mdiStop,
  mdiCircle,
  mdiPause,
  mdiMicrophone,
  mdiAlert,
  mdiMusicNote,
  mdiDownload,
} from "@mdi/js";
import { ssRdBarsScaleMiddleStatic } from "~/services/iconSetPath";
import { LocaleActor } from "~/services/locale";
import { AudioRecorderProcessor } from "~/dwdy/feature/sound/services/AudioRecorderProcessor";
import { getDurationString } from "~/services/duration";
import SvgIcon from "~/components/SvgIcon.vue";
import AudioVisualizer from "~/dwdy/feature/sound/components/AudioVisualizer.vue";

const emit = defineEmits<{
  (e: "stop", data: Blob): void;
}>();

const la = new LocaleActor("dwdy.feature.sound");
const arProcessor = ref<AudioRecorderProcessor>(new AudioRecorderProcessor());

watch(
  () => [arProcessor.value.storedAudio],
  async () => {
    if (arProcessor.value.storedAudio) {
      emit("stop", arProcessor.value.storedAudio.blob);
    }
  }
);

async function onRecordBtnClicked(): Promise<void> {
  if (!arProcessor.value.isReady) {
    await arProcessor.value.setupRecorder();
  }
  if (arProcessor.value.status === "ready") {
    arProcessor.value.start();
  }
  if (arProcessor.value.status === "paused") {
    arProcessor.value.resume();
  }
}
</script>
<template>
  <div class="relative flex flex-col">
    <div class="flex-none">
      <div class="p-2 mb-3 border border-base-200 rounded-md shadow-md">
        <div class="w-full flex items-center">
          <div class="ml-2 mr-3 my-4">
            <SvgIcon
              class="text-primary"
              icon-set="mdi"
              :path="mdiMicrophone"
              :size="40"
            ></SvgIcon>
          </div>
          <div
            class="grow self-stretch relative border-2 border-base-200 bg-microphone rounded-md"
          >
            <AudioVisualizer
              class="absolute inset-0 h-full w-full text-base-200"
              :data-set="arProcessor.visualDataSet"
            ></AudioVisualizer>
            <div
              class="absolute inset-0 h-full w-full flex justify-center items-center p-2"
            >
              <div class="grow flex justify-center items-center">
                <button
                  v-if="arProcessor.status === 'recording'"
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  @click="arProcessor.pause()"
                >
                  <SvgIcon
                    class="text-base-content"
                    icon-set="mdi"
                    :path="mdiPause"
                    :size="24"
                  ></SvgIcon>
                </button>
                <button
                  v-else
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  @click="onRecordBtnClicked"
                >
                  <SvgIcon
                    class="text-error"
                    icon-set="mdi"
                    :path="mdiCircle"
                    :size="20"
                  ></SvgIcon>
                </button>
                <button
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  @click="arProcessor.stop()"
                >
                  <SvgIcon
                    :class="
                      arProcessor.status === 'init' ||
                      arProcessor.status === 'ready'
                        ? 'text-base-300'
                        : 'text-base-content'
                    "
                    icon-set="mdi"
                    :path="mdiStop"
                    :size="24"
                  ></SvgIcon>
                </button>
                <div class="ml-8 flex items-center">
                  <SvgIcon
                    v-if="arProcessor.storedAudio"
                    icon-set="mdi"
                    :path="mdiMusicNote"
                    :size="24"
                  ></SvgIcon>
                  <SvgIcon
                    v-if="arProcessor.status === 'paused'"
                    icon-set="ss"
                    :path="ssRdBarsScaleMiddleStatic"
                    :size="24"
                  ></SvgIcon>
                  <Icon
                    v-if="arProcessor.status === 'recording'"
                    :icon="barsScaleMiddle"
                    :width="24"
                    :height="24"
                  ></Icon>
                  <div class="ml-3 font-bold text-primary">
                    <div
                      v-if="
                        arProcessor.status === 'recording' ||
                        arProcessor.status === 'paused'
                      "
                    >
                      {{ getDurationString(arProcessor.duration) }}
                    </div>
                    <div v-if="arProcessor.storedAudio">
                      {{ getDurationString(arProcessor.storedAudio.duration) }}
                    </div>
                  </div>
                </div>
                <a
                  v-if="arProcessor.storedAudio"
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  target="_blank"
                  download="test.webm"
                  :href="arProcessor.storedAudio.dataUrl"
                >
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiDownload"
                    :size="20"
                  ></SvgIcon>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="arProcessor.status === 'error'"
          class="mt-2 flex flex-col md:flex-row gap-2"
        >
          <div
            class="flex-1 p-3 border border-base-200 rounded flex items-center"
          >
            <SvgIcon
              class="ml-2"
              icon-set="mdi"
              :path="mdiAlert"
              :size="28"
            ></SvgIcon>
            {{ la.t(`.AudioRecorder.error.${arProcessor.error.reason}`) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-microphone {
  background-color: transparent;
  background-image: linear-gradient(
      hsl(var(--b2, var(--b1)) / 0.6) 0.8px,
      transparent 0.8px
    ),
    linear-gradient(
      to right,
      hsl(var(--b2, var(--b1)) / 0.6) 0.8px,
      transparent 0.8px
    );
  background-size: 6px 6px;
}
</style>
