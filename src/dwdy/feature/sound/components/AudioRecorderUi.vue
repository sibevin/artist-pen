<script setup lang="ts">
import { watch } from "vue";
import {
  mdiStop,
  mdiCircle,
  mdiPause,
  mdiMicrophone,
  mdiSquareCircle,
  mdiFolderMusic,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAudioState } from "~/dwdy/feature/sound/state/useAudioState";
import { getDurationString } from "~/services/duration";
import { importAudio } from "~/dwdy/feature/sound/action";
import SvgIcon from "~/components/SvgIcon.vue";
import AudioVisualizer from "~/dwdy/feature/sound/components/AudioVisualizer.vue";

const ACCEPT_FORMATS = [
  "audio/3gpp",
  "audio/aac",
  "audio/flac",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
] as const;

const emit = defineEmits<{
  (e: "store"): void;
}>();

const la = new LocaleActor("dwdy.feature.sound");
const audioState = useAudioState();

watch(
  () => [audioState.recorder.value.storedRecords],
  () => {
    emit("store");
  }
);

async function onRecordBtnClicked(): Promise<void> {
  audioState.recorder.value.start();
}

async function onRestartRecordingBtnClicked(): Promise<void> {
  audioState.recorder.value.resume();
}

async function onSaveAndStopBtnClicked(): Promise<void> {
  audioState.recorder.value.stop();
}

async function onSaveAndRecordBtnClicked(): Promise<void> {
  audioState.recorder.value.stopAndStart();
}

async function onImportFileSelected(event: Event): Promise<void> {
  const files = event.target && (event.target as HTMLInputElement).files;
  if (!files) {
    return;
  }
  for (const file of files as FileList) {
    const fr = new FileReader();
    fr.onload = async () => {
      const result = fr.result as ArrayBuffer;
      if (result) {
        await importAudio(file, result);
      }
    };
    fr.readAsArrayBuffer(file);
  }
}
</script>
<template>
  <div class="relative flex flex-col">
    <div
      class="grow border-2 border-base-200 bg-microphone rounded-md flex flex-col items-stretch"
    >
      <div class="grow flex justify-center items-center">
        <div
          class="h-32 w-32 my-3 rounded-full bg-base-100/60 shadow-lg flex justify-center items-center"
        >
          <SvgIcon
            class="text-base-200 h-16 w-16"
            icon-set="mdi"
            :path="mdiMicrophone"
          ></SvgIcon>
        </div>
      </div>
      <div class="m-4 border border-x-8 border-primary bg-base-100 shadow-md">
        <div class="m-2 flex items-center">
          <div class="grow relative h-16 border border-base-300 rounded-md">
            <AudioVisualizer
              class="absolute inset-0 h-full w-full text-base-200"
              :data-set="audioState.recorder.value.visualDataSet"
            ></AudioVisualizer>
          </div>
          <div class="px-5 font-bold text-primary">
            <div
              v-if="
                audioState.recorder.value.status === 'recording' ||
                audioState.recorder.value.status === 'paused'
              "
            >
              {{ getDurationString(audioState.recorder.value.duration) }}
            </div>
            <div v-else>
              {{ getDurationString(0) }}
            </div>
          </div>
        </div>
        <div class="w-full mt-4 flex md:hidden justify-center items-center">
          <label
            v-if="
              audioState.recorder.value.status === 'init' ||
              audioState.recorder.value.status === 'stopped'
            "
            class="btn btn-ghost hover:bg-base-100"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiFolderMusic"
              :size="18"
            ></SvgIcon>
            {{ la.t(".import") }}
            <input
              class="hidden"
              type="file"
              :multiple="true"
              :accept="ACCEPT_FORMATS.join(',')"
              @change="onImportFileSelected"
            />
          </label>
          <button
            v-if="audioState.recorder.value.isInRecording"
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
        <div class="w-full mb-2 flex justify-center items-center">
          <button
            v-if="
              audioState.recorder.value.status === 'init' ||
              audioState.recorder.value.status === 'stopped'
            "
            class="btn btn-ghost hover:bg-base-100"
            @click="onRecordBtnClicked"
          >
            <SvgIcon
              class="text-error mr-2"
              icon-set="mdi"
              :path="mdiCircle"
              :size="18"
            ></SvgIcon>
            {{ la.t(".record") }}
          </button>
          <button
            v-if="audioState.recorder.value.status === 'recording'"
            class="btn btn-ghost hover:bg-base-100"
            @click="audioState.recorder.value.pause()"
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
            v-if="audioState.recorder.value.status === 'paused'"
            class="btn btn-ghost hover:bg-base-100"
            @click="onRestartRecordingBtnClicked"
          >
            <SvgIcon
              class="text-error mr-2"
              icon-set="mdi"
              :path="mdiCircle"
              :size="18"
            ></SvgIcon>
            {{ la.t(".continue") }}
          </button>
          <button
            class="btn btn-ghost hover:bg-base-100"
            :class="
              audioState.recorder.value.isInRecording
                ? 'text-base-content'
                : 'text-base-300'
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
            v-if="audioState.recorder.value.isInRecording"
            class="hidden md:inline-flex btn btn-ghost hover:bg-base-100"
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
          <label
            v-if="
              audioState.recorder.value.status === 'init' ||
              audioState.recorder.value.status === 'stopped'
            "
            class="hidden md:inline-flex btn btn-ghost hover:bg-base-100"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiFolderMusic"
              :size="18"
            ></SvgIcon>
            {{ la.t(".import") }}
            <input
              class="hidden"
              type="file"
              :multiple="true"
              :accept="ACCEPT_FORMATS.join(',')"
              @change="onImportFileSelected"
            />
          </label>
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
