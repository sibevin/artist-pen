<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Icon } from "@iconify/vue";
import barsScaleMiddle from "@iconify-icons/svg-spinners/bars-scale-middle";
import {
  mdiStop,
  mdiPause,
  mdiPlay,
  mdiRepeat,
  mdiRepeatOff,
  mdiSpeaker,
  mdiVolumeSource,
  mdiFileOutline,
  mdiVolumeMedium,
  mdiVolumeHigh,
  mdiFormatHorizontalAlignCenter,
  mdiVolumeMute,
  mdiVolumeVariantOff,
} from "@mdi/js";
import { ssRdBarsScaleMiddleStatic } from "~/services/iconSetPath";
import { getDurationString } from "~/services/duration";
import { AudioPlayerProcessor } from "~/dwdy/feature/sound/services/AudioPlayerProcessor";
import AudioVisualizer from "~/dwdy/feature/sound/components/AudioVisualizer.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const apProcessor = ref<AudioPlayerProcessor>(new AudioPlayerProcessor());
const isPlayerVolumeShown = ref<boolean>(false);
const playerIsLoop = ref<boolean>(false);
const playerVolume = ref<number>(100);
const playerStereoPan = ref<number>(0);
const playerIsMuted = ref<boolean>(false);

const props = defineProps({
  audioData: {
    type: String,
    default: undefined,
  },
  volume: {
    type: Number,
    default: undefined,
  },
});

function currentRepectIcon(): string {
  if (playerIsLoop.value) {
    return mdiRepeat;
  } else {
    return mdiRepeatOff;
  }
}

const playerCurrentTimeBinding = computed<number>({
  get() {
    return apProcessor.value.currentTime;
  },
  set(value: number) {
    apProcessor.value.setCurrentTime(value);
  },
});

const playerVolumeBinding = computed<number>({
  get() {
    return playerVolume.value;
  },
  set(value: number) {
    updatePlayerVolume(value);
  },
});

const playerStereoPanBinding = computed<number>({
  get() {
    return playerStereoPan.value;
  },
  set(value: number) {
    updatePlayerStereoPan(value);
  },
});

watch(
  () => [props.audioData],
  async () => {
    if (props.audioData) {
      fetchAudioData();
    } else {
      apProcessor.value.close();
    }
  }
);

watch(
  () => apProcessor.value.isReady,
  (newValue, oldValue) => {
    if (!oldValue && newValue) {
      if (props.volume) {
        updatePlayerVolume(props.volume);
      } else {
        playerVolume.value = Math.round(apProcessor.value.volume * 100);
      }
      playerIsLoop.value = apProcessor.value.isLoop;
    }
  }
);

function fetchAudioData(): void {
  if (props.audioData) {
    apProcessor.value.init(props.audioData);
  }
}

fetchAudioData();

function updatePlayerVolume(value: number): void {
  playerVolume.value = value;
  apProcessor.value.setVolume(value / 100);
  // TODO: Store to config
}

function updatePlayerStereoPan(value: number): void {
  playerStereoPan.value = value;
  apProcessor.value.setStereoPan(value / 50);
}

function onVolumeBtnClicked(): void {
  isPlayerVolumeShown.value = !isPlayerVolumeShown.value;
}

function onSwitchRepeatBtnClicked(): void {
  playerIsLoop.value = apProcessor.value.switchLoop();
}

function switchPlayerIsMuted(): void {
  playerIsMuted.value = apProcessor.value.switchMuted();
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
              :path="mdiSpeaker"
              :size="40"
            ></SvgIcon>
          </div>
          <div
            class="grow self-stretch relative border-2 border-base-200 bg-speaker rounded-md"
          >
            <AudioVisualizer
              class="absolute inset-0 h-full w-full text-base-200"
              :data-set="apProcessor.visualDataSet"
            ></AudioVisualizer>
            <div
              class="absolute inset-0 h-full w-full flex justify-center items-center p-2"
            >
              <div class="grow flex justify-center items-center">
                <button
                  v-if="apProcessor.status === 'playing'"
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  @click="apProcessor.pause()"
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
                  @click="apProcessor.play()"
                >
                  <SvgIcon
                    class="text-base-content"
                    icon-set="mdi"
                    :path="mdiPlay"
                    :size="24"
                  ></SvgIcon>
                </button>
                <button
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  @click="apProcessor.stop()"
                >
                  <SvgIcon
                    :class="
                      apProcessor.status === 'stopped'
                        ? 'text-base-300'
                        : 'text-base-content'
                    "
                    icon-set="mdi"
                    :path="mdiStop"
                    :size="24"
                  ></SvgIcon>
                </button>
                <button
                  class="btn btn-circle btn-ghost hover:bg-base-100"
                  @click="onSwitchRepeatBtnClicked"
                >
                  <SvgIcon
                    class="text-base-content"
                    icon-set="mdi"
                    :path="currentRepectIcon()"
                    :size="24"
                  ></SvgIcon>
                </button>
              </div>
              <button
                class="btn btn-circle btn-ghost text-base-content"
                :class="
                  isPlayerVolumeShown
                    ? 'bg-base-200 hover:bg-base-200 '
                    : 'hover:bg-base-100'
                "
                @click="onVolumeBtnClicked"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiVolumeMedium"
                  :size="24"
                ></SvgIcon>
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="isPlayerVolumeShown"
          class="mt-2 flex flex-col md:flex-row gap-2"
        >
          <div
            class="flex-1 p-3 border border-base-200 rounded flex items-center"
          >
            <SvgIcon
              class="ml-2"
              icon-set="mdi"
              :path="playerIsMuted ? mdiVolumeMute : mdiVolumeSource"
              :size="28"
            ></SvgIcon>
            <input
              v-model="playerVolumeBinding"
              type="range"
              min="0"
              :max="100"
              class="range range-xs range-base-200 mx-3"
              :class="{ 'range-disabled': playerIsMuted }"
              :disabled="playerIsMuted"
            />
            <div class="flex-none w-6 text-right mr-2">
              {{ playerVolumeBinding }}
            </div>
            <button
              class="btn btn-ghost border border-base-200 hover:bg-base-100 hover:border-base-200"
              @click="switchPlayerIsMuted()"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiVolumeVariantOff"
                :size="24"
              ></SvgIcon>
            </button>
          </div>
          <div
            class="flex-1 p-3 border border-base-200 rounded flex items-center"
          >
            <div class="flex-none w-6 text-right mx-2">
              {{ 50 - playerStereoPan }}
            </div>
            <SvgIcon
              icon-set="mdi"
              :path="mdiVolumeHigh"
              :size="28"
              flip="h"
            ></SvgIcon>
            <input
              v-model.number="playerStereoPanBinding"
              type="range"
              min="-50"
              :max="50"
              class="range range-tune-bar range-tune-bar-base-200 range-tune-bar-xs mx-3"
            />
            <SvgIcon icon-set="mdi" :path="mdiVolumeHigh" :size="28"></SvgIcon>
            <div class="flex-none w-6 text-right mx-2">
              {{ 50 + playerStereoPan }}
            </div>
            <button
              class="btn btn-ghost border border-base-200 hover:bg-base-100 hover:border-base-200"
              :class="{ 'text-base-300': playerStereoPan === 0 }"
              @click="updatePlayerStereoPan(0)"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiFormatHorizontalAlignCenter"
                :size="24"
              ></SvgIcon>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="m-4 mt-2 flex items-center">
      <div class="flex-none">
        <SvgIcon
          v-if="
            apProcessor.status !== 'playing' && apProcessor.status !== 'paused'
          "
          icon-set="mdi"
          :path="mdiFileOutline"
          :size="24"
        ></SvgIcon>
        <SvgIcon
          v-if="apProcessor.status === 'paused'"
          icon-set="ss"
          :path="ssRdBarsScaleMiddleStatic"
          :size="24"
        ></SvgIcon>
        <Icon
          v-if="apProcessor.status === 'playing'"
          :icon="barsScaleMiddle"
          :width="24"
          :height="24"
        ></Icon>
      </div>
      <div class="grow pt-1 pl-3">
        <input
          v-model="playerCurrentTimeBinding"
          type="range"
          min="0"
          :max="Math.floor(apProcessor.duration)"
          class="range range-process-bar range-process-bar-primary range-xs"
        />
      </div>
      <div class="pl-4 pr-2">
        <div class="font-bold text-primary">
          {{ getDurationString(playerCurrentTimeBinding) }}
        </div>
        <div class="">
          {{ getDurationString(apProcessor.duration) }}
        </div>
      </div>
      <button
        v-if="apProcessor.status === 'playing'"
        class="btn btn-circle btn-ghost"
        @click="apProcessor.pause()"
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
        class="btn btn-circle btn-ghost"
        @click="apProcessor.play()"
      >
        <SvgIcon
          class="text-base-content"
          icon-set="mdi"
          :path="mdiPlay"
          :size="24"
        ></SvgIcon>
      </button>
      <button class="btn btn-circle btn-ghost" @click="apProcessor.stop()">
        <SvgIcon
          :class="
            apProcessor.status === 'stopped'
              ? 'text-base-300'
              : 'text-base-content'
          "
          icon-set="mdi"
          :path="mdiStop"
          :size="24"
        ></SvgIcon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bg-speaker {
  background-image: repeating-linear-gradient(
      45deg,
      hsl(var(--b2, var(--b1)) / 0.6) 25%,
      transparent 25%,
      transparent 75%,
      hsl(var(--b2, var(--b1)) / 0.6) 75%,
      hsl(var(--b2, var(--b1)) / 0.6)
    ),
    repeating-linear-gradient(
      45deg,
      hsl(var(--b2, var(--b1)) / 0.6) 25%,
      transparent 25%,
      transparent 75%,
      hsl(var(--b2, var(--b1)) / 0.6) 75%,
      hsl(var(--b2, var(--b1)) / 0.6)
    );
  background-position: 0 0, 6px 6px;
  background-size: 12px 12px;
}
</style>
