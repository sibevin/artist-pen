import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { AppConfig } from "~/models/app/config";
import { HotkeyProvider } from "~/services/hotkeyProvider";

export const useAppState = createGlobalState(() => {
  const config = ref<AppConfig>(new AppConfig());
  const hk = ref<HotkeyProvider>(new HotkeyProvider());
  hk.value.registerDefaultKeys();
  return { config, hk };
});
