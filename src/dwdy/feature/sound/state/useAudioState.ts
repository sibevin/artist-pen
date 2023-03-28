import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { AudioRecorder } from "~/dwdy/feature/sound/services/AudioRecorder";
import { AudioPlayerProcessor } from "../services/AudioPlayerProcessor";

export const useAudioState = createGlobalState(() => {
  const recorder = ref<AudioRecorder>(new AudioRecorder());
  const player: AudioPlayerProcessor = new AudioPlayerProcessor();
  const refreshKey = ref<number>(1);
  player.refreshFn = () => {
    refreshKey.value *= -1;
  };
  function stopAllAudioDevices(): void {
    recorder.value.stop();
    player.stop();
  }
  return {
    recorder,
    player,
    refreshKey,
    stopAllAudioDevices,
  };
});
