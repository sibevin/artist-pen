<script setup lang="ts">
import { ref, watch, computed, PropType } from "vue";
import {
  mdiStop,
  mdiPause,
  mdiPlay,
  mdiVolumeMedium,
  mdiSpeaker,
  mdiVolumeHigh,
  mdiFormatHorizontalAlignCenter,
  mdiDownload,
  mdiVolumeMute,
  mdiTune,
} from "@mdi/js";
import { getDurationString } from "~/services/duration";
import { useAudioState } from "~/dwdy/feature/sound/state/useAudioState";
import {
  FeatureConfig,
  DEFAULT_FEATURE_CONFIG,
} from "~/dwdy/feature/sound/def";
import AudioVisualizer from "~/dwdy/feature/sound/components/AudioVisualizer.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  audioDataUrl: {
    type: String,
    default: undefined,
  },
  config: {
    type: Object as PropType<FeatureConfig>,
    default: () => DEFAULT_FEATURE_CONFIG,
  },
  fileName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "updateConfig", value: Partial<FeatureConfig>): void;
}>();

const audioState = useAudioState();
const isPlayerVolumeShown = ref<boolean>(false);
const playerVolume = ref<number>(props.config.volume);
const playerStereoPan = ref<number>(props.config.stereoPan);
const playerIsMuted = ref<boolean>(false);

const playerStatus = computed<string>(() => {
  audioState.refreshKey.value;
  return audioState.player.status;
});

const playerCurrentTimeBinding = computed<number>({
  get() {
    audioState.refreshKey.value;
    return audioState.player.currentTime;
  },
  set(value: number) {
    audioState.player.setCurrentTime(value);
  },
});

const playerVolumeBinding = computed<number>({
  get() {
    audioState.refreshKey.value;
    return playerVolume.value;
  },
  set(value: number) {
    updatePlayerVolume(value);
  },
});

const playerStereoPanBinding = computed<number>({
  get() {
    audioState.refreshKey.value;
    return playerStereoPan.value;
  },
  set(value: number) {
    updatePlayerStereoPan(value);
  },
});

watch(
  () => [props.audioDataUrl],
  async () => {
    if (props.audioDataUrl) {
      fetchAudioData();
    } else {
      audioState.player.reset();
    }
  }
);

watch(
  () => audioState.player.isReady,
  (newValue, oldValue) => {
    if (!oldValue && newValue) {
      updatePlayerVolume(props.config.volume);
      updatePlayerStereoPan(props.config.stereoPan);
    }
  }
);

function fetchAudioData(): void {
  if (props.audioDataUrl) {
    audioState.player.load(props.audioDataUrl);
  }
}

fetchAudioData();

function updatePlayerVolume(value: number): void {
  playerVolume.value = value;
  audioState.player.setVolume(value / 100);
  emit("updateConfig", { volume: playerVolume.value });
}

function updatePlayerStereoPan(value: number): void {
  playerStereoPan.value = value;
  audioState.player.setStereoPan(value / 50);
  emit("updateConfig", { stereoPan: playerStereoPan.value });
}

function onPlayBtnClicked(): void {
  audioState.player.play();
  playerIsMuted.value = false;
}

function onVolumeBtnClicked(): void {
  isPlayerVolumeShown.value = !isPlayerVolumeShown.value;
}

function switchPlayerIsMuted(): void {
  playerIsMuted.value = audioState.player.switchMuted();
}
</script>
<template>
  <div class="relative flex flex-col">
    <div
      class="grow border-2 border-base-200 bg-speaker rounded-md flex flex-col justify-end items-stretch"
    >
      <div
        class="absolute top-0 right-0 left-0 h-[80vw] md:static md:h-fit md:grow flex justify-center items-center"
      >
        <div
          class="h-32 w-32 my-3 rounded-full bg-base-100/60 shadow-lg flex justify-center items-center"
        >
          <SvgIcon
            class="text-base-200 h-16 w-16"
            icon-set="mdi"
            :path="mdiSpeaker"
          ></SvgIcon>
        </div>
      </div>
      <div
        class="absolute bottom-0 right-0 left-0 md:static m-4 mt-0 border border-x-8 border-primary bg-base-100 shadow-md"
      >
        <div class="m-2 flex items-center">
          <div class="grow border border-base-300 rounded-md">
            <div class="relative h-16">
              <AudioVisualizer
                class="absolute inset-0 h-full w-full text-base-200"
                :data-set="audioState.player.visualDataSet"
              ></AudioVisualizer>
            </div>
          </div>
          <div class="px-5 text-primary">
            <div class="font-bold">
              {{ getDurationString(playerCurrentTimeBinding) }}
            </div>
            <div class="">
              {{ getDurationString(audioState.player.duration) }}
            </div>
          </div>
        </div>
        <div class="mx-2 mt-4">
          <input
            v-model="playerCurrentTimeBinding"
            type="range"
            min="0"
            step="0.1"
            :max="Math.floor(audioState.player.duration)"
            class="range range-process-bar range-process-bar-base-200 range-xs mb-0"
          />
        </div>
        <div class="m-3 flex items-center">
          <div class="grow flex justify-center items-center">
            <button
              v-if="playerStatus === 'playing'"
              class="btn btn-circle btn-ghost hover:bg-base-100"
              @click="audioState.player.pause()"
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
              @click="onPlayBtnClicked"
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
              @click="audioState.player.stop()"
            >
              <SvgIcon
                :class="
                  playerStatus === 'stopped'
                    ? 'text-base-300'
                    : 'text-base-content'
                "
                icon-set="mdi"
                :path="mdiStop"
                :size="24"
              ></SvgIcon>
            </button>
            <a
              class="btn btn-circle btn-ghost hover:bg-base-100"
              :href="props.audioDataUrl"
              :download="props.fileName"
              target="_blank"
            >
              <SvgIcon
                class="text-base-content"
                icon-set="mdi"
                :path="mdiDownload"
                :size="24"
              ></SvgIcon>
            </a>
            <div class="hidden md:flex items-center">
              <button
                class="btn btn-circle btn-ghost hover:bg-base-100"
                @click="switchPlayerIsMuted()"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="playerIsMuted ? mdiVolumeMute : mdiVolumeMedium"
                  :size="24"
                ></SvgIcon>
              </button>
              <input
                v-model="playerVolumeBinding"
                type="range"
                min="0"
                :max="100"
                class="range range-xs range-base-200 mr-3"
                :class="{ 'range-disabled': playerIsMuted }"
                :disabled="playerIsMuted"
              />
            </div>
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
            <SvgIcon icon-set="mdi" :path="mdiTune" :size="24"></SvgIcon>
          </button>
        </div>
        <div
          v-if="isPlayerVolumeShown"
          class="m-2 flex flex-col md:flex-row gap-2"
        >
          <div
            class="flex-1 p-3 border border-base-200 rounded flex items-center"
          >
            <SvgIcon
              class="ml-2"
              icon-set="mdi"
              :path="playerIsMuted ? mdiVolumeMute : mdiVolumeMedium"
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
                :path="playerIsMuted ? mdiVolumeMedium : mdiVolumeMute"
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
