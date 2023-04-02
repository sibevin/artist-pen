<script setup lang="ts">
import { ref, watch, computed, PropType } from "vue";
import {
  mdiStop,
  mdiPause,
  mdiPlay,
  mdiVolumeSource,
  mdiVolumeMedium,
  mdiVolumeMute,
  mdiShuffleVariant,
  mdiTune,
  mdiAnimationPlay,
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
  mdiFileEditOutline,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { getDurationString } from "~/services/duration";
import { useDwdyState } from "~/states/useDwdyState";
import {
  FeatureConfig,
  DEFAULT_FEATURE_CONFIG,
  SoundSource,
  SoundTrack,
  REPEAT_MODES,
  SOUND_FROM_ICON,
} from "~/dwdy/feature/sound/def";
import { repeatOpts, REPEAT_ICON_MAP } from "~/dwdy/feature/sound/map";
import { chooseNextTrackIndex } from "~/dwdy/feature/sound/action";
import { useAudioState } from "~/dwdy/feature/sound/state/useAudioState";
import { nextEntry } from "~/services/loopArray";
import AudioVisualizer from "~/dwdy/feature/sound/components/AudioVisualizer.vue";
import SvgIcon from "~/components/SvgIcon.vue";

type PlayerConfig = FeatureConfig & { isMuted: boolean };

const props = defineProps({
  soundSources: {
    type: Array as PropType<SoundSource[]>,
    default: () => [],
  },
  config: {
    type: Object as PropType<FeatureConfig>,
    default: () => DEFAULT_FEATURE_CONFIG,
  },
});

const emit = defineEmits<{
  (e: "updateConfig", value: Partial<FeatureConfig>): void;
  (e: "triggerEditor"): void;
}>();

const la = new LocaleActor("dwdy.feature.sound");
const dwdyState = useDwdyState();
const audioState = useAudioState();
const randomPlayedIndexes: number[] = [];
const isPlayerConfigShown = ref<boolean>(false);
const playerConfig = ref<PlayerConfig>(
  Object.assign({ isMuted: false }, props.config)
);
const soundTracks = ref<SoundTrack[]>([]);
const currentSoundTrackIndex = ref<number>(0);

const currentSoundTrack = computed<SoundTrack | undefined>(() => {
  return soundTracks.value[currentSoundTrackIndex.value];
});

initPlayer();
audioState.player.endCallback = () => {
  const nextIndex = chooseNextTrackIndex(
    playerConfig.value,
    currentSoundTrackIndex.value,
    soundTracks.value.length,
    randomPlayedIndexes
  );
  if (nextIndex !== null) {
    if (playerConfig.value.isShuffleOn) {
      if (randomPlayedIndexes.length === soundTracks.value.length) {
        randomPlayedIndexes.splice(0);
      }
      randomPlayedIndexes.push(nextIndex);
    }
    switchTrack(nextIndex, true);
  } else {
    audioState.player.stop();
  }
};

watch(
  () => [props.soundSources],
  () => {
    initPlayer();
  }
);

function initPlayer(): void {
  soundTracks.value = props.soundSources.map((soundSource) => {
    return Object.assign({}, soundSource, { duration: 0 });
  });
  currentSoundTrackIndex.value = 0;
  loadTrack();
}

function loadTrack(playFrom?: number): void {
  if (currentSoundTrack.value) {
    const soundDataUrl = URL.createObjectURL(currentSoundTrack.value.data);
    if (playFrom !== undefined) {
      audioState.player.startPlayingTime = playFrom;
    }
    audioState.player.load(soundDataUrl);
  }
}

function switchTrack(index: number, startPlaying = false): void {
  if (currentSoundTrack.value) {
    currentSoundTrack.value.duration = audioState.player.currentTime;
  }
  currentSoundTrackIndex.value = index;
  if (currentSoundTrack.value) {
    const startFrom = startPlaying
      ? currentSoundTrack.value.duration
      : undefined;
    loadTrack(startFrom);
  }
}

function currentRepectIcon(): string {
  return REPEAT_ICON_MAP[playerConfig.value.repeat].path;
}

const playerCurrentTimeBinding = computed<number>({
  get() {
    audioState.refreshKey.value;
    return audioState.player.currentTime;
  },
  set(value: number) {
    if (currentSoundTrack.value) {
      currentSoundTrack.value.duration = value;
    }
    audioState.player.setCurrentTime(value);
  },
});

const playerVolumeBinding = computed<number>({
  get() {
    audioState.refreshKey.value;
    return playerConfig.value.volume;
  },
  set(value: number) {
    updatePlayerVolume(value);
  },
});

watch(
  () => audioState.player.isReady,
  (newValue, oldValue) => {
    if (!oldValue && newValue) {
      updatePlayerVolume(props.config.volume);
      updatePlayerStereoPan(props.config.stereoPan);
    }
  }
);

function updatePlayerVolume(value: number): void {
  playerConfig.value.volume = value;
  audioState.player.setVolume(value / 100);
  emit("updateConfig", { volume: playerConfig.value.volume });
}

function updatePlayerStereoPan(value: number): void {
  playerConfig.value.stereoPan = value;
  audioState.player.setStereoPan(value / 50);
  emit("updateConfig", { stereoPan: playerConfig.value.stereoPan });
}

function onConfigBtnClicked(): void {
  isPlayerConfigShown.value = !isPlayerConfigShown.value;
}

function onSwitchRepeatBtnClicked(): void {
  playerConfig.value.repeat = nextEntry(
    REPEAT_MODES,
    playerConfig.value.repeat
  );
  emit("updateConfig", { repeat: playerConfig.value.repeat });
}

function onSwitchRandomBtnClicked(): void {
  playerConfig.value.isShuffleOn = !playerConfig.value.isShuffleOn;
  if (playerConfig.value.isShuffleOn) {
    randomPlayedIndexes.splice(0);
    randomPlayedIndexes.concat([...Array(soundTracks.value.length).keys()]);
  }
  emit("updateConfig", { isShuffleOn: playerConfig.value.isShuffleOn });
}

function onSwitchAutoNextBtnClicked(): void {
  playerConfig.value.isAutoplayOn = !playerConfig.value.isAutoplayOn;
  emit("updateConfig", { isAutoplayOn: playerConfig.value.isAutoplayOn });
}

function switchPlayerIsMuted(): void {
  playerConfig.value.isMuted = audioState.player.switchMuted();
}
</script>
<template>
  <div class="relative flex flex-col">
    <div class="flex-none">
      <div class="p-2 mb-3 border border-base-200 rounded-md shadow-md">
        <div class="w-full flex items-center">
          <div class="ml-2 mr-3">
            <SvgIcon
              class="text-primary"
              icon-set="mdi"
              :path="mdiVolumeSource"
              :size="32"
            ></SvgIcon>
          </div>
          <div
            class="grow self-stretch relative border-2 border-base-200 bg-speaker rounded-md"
          >
            <AudioVisualizer
              class="absolute inset-0 h-20 w-full text-base-200"
              :data-set="audioState.player.visualDataSet"
            ></AudioVisualizer>
            <div class="w-full flex justify-center items-center">
              <div class="grow flex flex-col justify-center items-center">
                <div class="self-stretch flex justify-between items-center p-4">
                  <div class="flex-1 flex justify-center items-center">
                    <button
                      v-if="audioState.player.status === 'playing'"
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
                      @click="audioState.player.play()"
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
                          audioState.player.status === 'stopped'
                            ? 'text-base-300'
                            : 'text-base-content'
                        "
                        icon-set="mdi"
                        :path="mdiStop"
                        :size="24"
                      ></SvgIcon>
                    </button>
                  </div>
                  <button
                    class="flex-none btn btn-circle btn-ghost hover:bg-base-100"
                    @click="emit('triggerEditor')"
                  >
                    <SvgIcon
                      icon-set="mdi"
                      :path="mdiFileEditOutline"
                      :size="24"
                    ></SvgIcon>
                  </button>
                </div>
                <div
                  class="self-stretch lg:self-center rounded bg-base-100/60 px-2 lg:px-1 py-1 m-2 mt-0"
                >
                  <div class="flex">
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
                    <button
                      class="btn btn-circle btn-ghost hover:bg-base-100"
                      @click="onSwitchRandomBtnClicked"
                    >
                      <SvgIcon
                        :class="
                          playerConfig.isShuffleOn
                            ? 'text-base-content'
                            : 'text-base-300'
                        "
                        icon-set="mdi"
                        :path="mdiShuffleVariant"
                        :size="24"
                      ></SvgIcon>
                    </button>
                    <button
                      class="btn btn-circle btn-ghost hover:bg-base-100"
                      @click="onSwitchAutoNextBtnClicked"
                    >
                      <SvgIcon
                        :class="
                          playerConfig.isAutoplayOn
                            ? 'text-base-content'
                            : 'text-base-300'
                        "
                        icon-set="mdi"
                        :path="mdiAnimationPlay"
                        :size="24"
                      ></SvgIcon>
                    </button>
                    <div class="grow lg:hidden"></div>
                    <div class="hidden grow lg:flex items-center">
                      <button
                        class="btn btn-circle btn-ghost hover:bg-base-100"
                        @click="switchPlayerIsMuted()"
                      >
                        <SvgIcon
                          icon-set="mdi"
                          :path="
                            playerConfig.isMuted
                              ? mdiVolumeMute
                              : mdiVolumeMedium
                          "
                          :size="24"
                        ></SvgIcon>
                      </button>
                      <input
                        v-model="playerVolumeBinding"
                        type="range"
                        min="0"
                        :max="100"
                        class="range range-xs range-base-200 mr-3"
                        :class="{ 'range-disabled': playerConfig.isMuted }"
                        :disabled="playerConfig.isMuted"
                      />
                    </div>
                    <button
                      class="hidden lg:inline-flex btn btn-circle btn-ghost text-base-content"
                      :class="
                        isPlayerConfigShown
                          ? 'bg-base-200 hover:bg-base-200 '
                          : 'hover:bg-base-100'
                      "
                      @click="onConfigBtnClicked"
                    >
                      <SvgIcon
                        icon-set="mdi"
                        :path="mdiTune"
                        :size="24"
                      ></SvgIcon>
                    </button>
                  </div>
                  <div
                    class="lg:hidden border-t border-base-200 mt-1 pt-1 flex justify-between items-center"
                  >
                    <div class="flex-1 flex items-center">
                      <button
                        class="btn btn-circle btn-ghost hover:bg-base-100"
                        @click="switchPlayerIsMuted()"
                      >
                        <SvgIcon
                          icon-set="mdi"
                          :path="
                            playerConfig.isMuted
                              ? mdiVolumeMute
                              : mdiVolumeMedium
                          "
                          :size="24"
                        ></SvgIcon>
                      </button>
                      <input
                        v-model="playerVolumeBinding"
                        type="range"
                        min="0"
                        :max="100"
                        class="range range-xs range-base-200 mx-3"
                        :class="{ 'range-disabled': playerConfig.isMuted }"
                        :disabled="playerConfig.isMuted"
                      />
                    </div>
                    <button
                      class="flex-none btn btn-circle btn-ghost text-base-content"
                      :class="
                        isPlayerConfigShown
                          ? 'bg-base-200 hover:bg-base-200 '
                          : 'hover:bg-base-100'
                      "
                      @click="onConfigBtnClicked"
                    >
                      <SvgIcon
                        icon-set="mdi"
                        :path="mdiTune"
                        :size="24"
                      ></SvgIcon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="isPlayerConfigShown" class="mt-2 flex flex-col gap-2">
          <div class="flex flex-col lg:flex-row gap-2">
            <div
              class="flex-1 p-3 border border-base-200 rounded flex justify-center"
            >
              <div class="grid grid-cols-3 gap-2">
                <label
                  v-for="opt in repeatOpts(la)"
                  :key="opt.value"
                  class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                  :class="{
                    'bg-base-200': playerConfig.repeat === opt.value,
                  }"
                >
                  <input
                    v-model="playerConfig.repeat"
                    type="radio"
                    name="layout"
                    class="hidden"
                    :value="opt.value"
                  />
                  <SvgIcon
                    v-if="opt.icon"
                    class="mb-2"
                    :icon-set="opt.icon.set"
                    :path="opt.icon.path"
                    :size="28"
                  ></SvgIcon>
                  <div>{{ opt.label }}</div>
                </label>
              </div>
            </div>
            <div
              class="flex-1 p-3 border border-base-200 rounded flex items-center"
            >
              <SvgIcon
                class="flex-none ml-1"
                icon-set="mdi"
                :path="playerConfig.isMuted ? mdiVolumeMute : mdiVolumeMedium"
                :size="20"
              ></SvgIcon>
              <input
                v-model="playerVolumeBinding"
                type="range"
                min="0"
                :max="100"
                class="range range-xs range-base-200 mx-3"
                :class="{ 'range-disabled': playerConfig.isMuted }"
                :disabled="playerConfig.isMuted"
              />
              <div class="flex-none w-6 text-right mr-3">
                {{ playerVolumeBinding }}
              </div>
              <button
                class="btn btn-ghost border border-base-200 hover:bg-base-100 hover:border-base-200"
                @click="switchPlayerIsMuted()"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="playerConfig.isMuted ? mdiVolumeMedium : mdiVolumeMute"
                  :size="24"
                ></SvgIcon>
              </button>
            </div>
          </div>
          <div class="flex flex-col lg:flex-row gap-2">
            <div
              class="flex-1 p-3 border border-base-200 rounded flex items-center"
            >
              <SvgIcon
                class="ml-1 mr-3"
                icon-set="mdi"
                :path="mdiShuffleVariant"
                :size="20"
              ></SvgIcon>
              <div class="grow">
                {{ la.t(".config.isShuffleOn.name") }}
              </div>
              <label
                class="swap mx-3"
                :class="{
                  'swap-active': playerConfig.isShuffleOn,
                }"
                @click="onSwitchRandomBtnClicked"
              >
                <div class="swap-on text-success flex items-center">
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiToggleSwitch"
                    :size="48"
                  ></SvgIcon>
                  {{ la.t("app.action.enable") }}
                </div>
                <div class="swap-off text-base-300 flex items-center">
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiToggleSwitchOffOutline"
                    :size="48"
                  ></SvgIcon>
                  {{ la.t("app.action.disable") }}
                </div>
              </label>
            </div>
            <div
              class="flex-1 p-3 border border-base-200 rounded flex items-center"
            >
              <SvgIcon
                class="ml-1 mr-3"
                icon-set="mdi"
                :path="mdiAnimationPlay"
                :size="20"
              ></SvgIcon>
              <div class="grow">
                {{ la.t(".config.isAutoplayOn.name") }}
              </div>
              <label
                class="swap mx-3"
                :class="{
                  'swap-active': playerConfig.isAutoplayOn,
                }"
                @click="onSwitchAutoNextBtnClicked"
              >
                <div class="swap-on text-success flex items-center">
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiToggleSwitch"
                    :size="48"
                  ></SvgIcon>
                  {{ la.t("app.action.enable") }}
                </div>
                <div class="swap-off text-base-300 flex items-center">
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiToggleSwitchOffOutline"
                    :size="48"
                  ></SvgIcon>
                  {{ la.t("app.action.disable") }}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="(soundTrack, index) in soundTracks"
      :key="index"
      class="ml-1 mr-5 mt-4"
    >
      <div class="flex items-center">
        <div class="flex-none min-w-[4rem]">
          <button
            class="w-full px-2 py-1 rounded flex justify-center items-center"
            :class="
              currentSoundTrackIndex === index
                ? 'rounded bg-primary text-primary-content'
                : 'bg-base-200 text-primary'
            "
            @click="switchTrack(index)"
          >
            <div v-if="soundTrack.meta.from" class="mr-1">
              <SvgIcon
                :icon-set="SOUND_FROM_ICON[soundTrack.meta.from].set"
                :path="SOUND_FROM_ICON[soundTrack.meta.from].path"
                :size="20"
              ></SvgIcon>
            </div>
            {{ index + 1 }}
          </button>
        </div>
        <div class="grow pt-1 pl-3">
          <input
            v-if="currentSoundTrackIndex === index"
            v-model="playerCurrentTimeBinding"
            type="range"
            min="0"
            :max="Math.floor(audioState.player.duration)"
            step="0.1"
            class="range range-process-bar range-process-bar-primary range-xs"
          />
          <input
            v-else
            v-model="soundTrack.duration"
            type="range"
            min="0"
            :max="soundTrack.meta.duration / 1000"
            step="0.1"
            class="range range-process-bar range-process-bar-primary range-xs cursor-default"
            :disabled="true"
          />
        </div>
        <div class="pl-4 pr-2">
          <div
            v-if="currentSoundTrackIndex === index"
            class="font-bold text-primary"
          >
            {{ getDurationString(playerCurrentTimeBinding) }}
          </div>
          <div class="">
            {{ getDurationString(soundTrack.meta.duration / 1000) }}
          </div>
        </div>
        <div v-if="currentSoundTrackIndex === index">
          <button
            v-if="audioState.player.status === 'playing'"
            class="btn btn-circle btn-ghost"
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
            class="btn btn-circle btn-ghost"
            @click="audioState.player.play()"
          >
            <SvgIcon
              class="text-base-content"
              icon-set="mdi"
              :path="mdiPlay"
              :size="24"
            ></SvgIcon>
          </button>
        </div>
        <button
          v-else
          class="btn btn-circle btn-ghost"
          @click="switchTrack(index, true)"
        >
          <SvgIcon
            class="text-base-content"
            icon-set="mdi"
            :path="mdiPlay"
            :size="24"
          ></SvgIcon>
        </button>
      </div>
      <div
        v-if="soundTrack.meta && soundTrack.meta.comment"
        class="mr-10 mt-2 px-3 border-l-4 border-base-200 text-left select-text"
        :class="dwdyState.config.value.textFontStyle()"
        v-html="soundTrack.meta.comment"
      ></div>
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
