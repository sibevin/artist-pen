import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { AudioRecorder } from "~/dwdy/feature/sound/services/AudioRecorder";
import { AudioPlayerProcessor } from "~/dwdy/feature/sound/services/AudioPlayerProcessor";

export const useAudioState = createGlobalState(() => {
  const recorder: AudioRecorder = new AudioRecorder();
  const player: AudioPlayerProcessor = new AudioPlayerProcessor();
  const tickKey = ref<number>(1);
  recorder.tickFn = () => {
    tickKey.value *= -1;
  };
  player.tickFn = () => {
    tickKey.value *= -1;
  };
  function stopAllAudioDevices(): void {
    recorder.stop();
    player.stop();
  }
  return {
    recorder,
    player,
    tickKey,
    stopAllAudioDevices,
  };
});
