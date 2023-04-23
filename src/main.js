import { createApp } from "vue";
import { createWebHistory, createRouter } from "vue-router";
import { createMetaManager } from "vue-meta";
import "./assets/css/tailwind.css";
import App from "./App.vue";
import { routes } from "./configs/routes";
import { useAudioState } from "~/dwdy/feature/sound/state/useAudioState";

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach(() => {
  const audioState = useAudioState();
  audioState.stopAllAudioDevices();
  audioState.recorder.stopCallback = undefined;
  audioState.player.endCallback = undefined;
});

const metaManager = createMetaManager();

const app = createApp(App);
app.use(router);
app.use(metaManager);
app.mount("#app");
