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
  mdiWaveform,
  mdiDownload,
  mdiSquareCircle,
} from "@mdi/js";
import { ssRdBarsScaleMiddleStatic } from "~/services/iconSetPath";
import { LocaleActor } from "~/services/locale";
import { AudioRecorderProcessor } from "~/dwdy/feature/sound/services/AudioRecorderProcessor";
import { getDurationString } from "~/services/duration";
import SvgIcon from "~/components/SvgIcon.vue";
import AudioVisualizer from "~/dwdy/feature/sound/components/AudioVisualizer.vue";

const emit = defineEmits<{
  (e: "stop", value: { blob: Blob; duration: number; continue: boolean }): void;
}>();

const la = new LocaleActor("dwdy.feature.sound");
const arProcessor = ref<AudioRecorderProcessor>(new AudioRecorderProcessor());
const continueRecording = ref(false);

watch(
  () => [arProcessor.value.storedAudio],
  async () => {
    if (arProcessor.value.storedAudio) {
      emit(
        "stop",
        Object.assign({}, arProcessor.value.storedAudio, {
          continue: continueRecording.value,
        })
      );
      if (continueRecording.value) {
        await renewRecorderAndStart();
      }
    }
  }
);

async function onRecordBtnClicked(): Promise<void> {
  if (arProcessor.value.status === "paused") {
    arProcessor.value.resume();
  } else {
    await renewRecorderAndStart();
  }
}

async function onSaveAndStopBtnClicked(): Promise<void> {
  continueRecording.value = false;
  await arProcessor.value.stop();
}

async function onSaveAndRecordBtnClicked(): Promise<void> {
  continueRecording.value = true;
  await arProcessor.value.stop();
}

async function renewRecorderAndStart(): Promise<void> {
  arProcessor.value = new AudioRecorderProcessor();
  await arProcessor.value.setupRecorder();
  await arProcessor.value.start();
}

async function stopRecording(): Promise<void> {
  await onSaveAndStopBtnClicked();
}
defineExpose({ stopRecording });
</script>
<template>
  <div class="relative flex flex-col">
    <div
      class="grow border-2 border-base-200 bg-microphone rounded-md flex flex-col items-stretch"
    >
      <div class="grow flex justify-center items-center">
        <div
          class="h-32 w-32 my-6 rounded-full border border-base-300 bg-base-100 shadow-lg flex justify-center items-center"
        >
          <SvgIcon
            class="text-base-200"
            icon-set="mdi"
            :path="mdiMicrophone"
            :size="70"
          ></SvgIcon>
        </div>
      </div>
      <div class="m-4 border border-x-8 border-primary bg-base-100 shadow-md">
        <div class="m-2 flex items-center">
          <div class="grow relative h-16 border border-base-300 rounded-md">
            <AudioVisualizer
              class="absolute inset-0 h-full w-full text-base-200"
              :data-set="arProcessor.visualDataSet"
            ></AudioVisualizer>
          </div>
          <div class="px-5 font-bold text-primary">
            <div
              v-if="
                arProcessor.status === 'recording' ||
                arProcessor.status === 'paused'
              "
            >
              {{ getDurationString(arProcessor.duration) }}
            </div>
            <div v-else>
              {{ getDurationString(0) }}
            </div>
          </div>
        </div>
        <div class="w-full mb-2 flex justify-center items-center">
          <button
            v-if="arProcessor.status === 'recording'"
            class="btn btn-ghost hover:bg-base-100"
            @click="arProcessor.pause()"
          >
            <SvgIcon
              class="text-base-content mr-2"
              icon-set="mdi"
              :path="mdiPause"
              :size="24"
            ></SvgIcon>
            {{ la.t(".pause") }}
          </button>
          <button
            v-else
            class="btn btn-ghost hover:bg-base-100"
            @click="onRecordBtnClicked"
          >
            <SvgIcon
              class="text-error mr-2"
              icon-set="mdi"
              :path="mdiCircle"
              :size="18"
            ></SvgIcon>
            {{
              la.t(arProcessor.status === "paused" ? ".continue" : ".record")
            }}
          </button>
          <button
            class="btn btn-ghost hover:bg-base-100"
            :class="
              arProcessor.isInRecording ? 'text-base-content' : 'text-base-300'
            "
            @click="onSaveAndStopBtnClicked"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiStop"
              :size="24"
            ></SvgIcon>
            {{ la.t(".stop") }}
          </button>
          <button
            v-if="arProcessor.isInRecording"
            class="btn btn-ghost hover:bg-base-100"
            @click="onSaveAndRecordBtnClicked"
          >
            <SvgIcon
              class="text-error mr-2"
              icon-set="mdi"
              :path="mdiSquareCircle"
              :size="24"
            ></SvgIcon>
            {{ la.t(".saveAndRecord") }}
          </button>
        </div>
      </div>
    </div>
    <div class="hidden p-2 mb-3">
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
                @click="onSaveAndStopBtnClicked"
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
                  :path="mdiWaveform"
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
        v-if="true || arProcessor.status === 'error'"
        class="mt-2 flex flex-col md:flex-row gap-2"
      >
        <div
          class="flex-1 p-3 border border-base-200 rounded flex items-center"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiAlert"
            :size="24"
          ></SvgIcon>
          {{ la.t(`.AudioRecorder.error.${arProcessor.error.reason}`) }}
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
