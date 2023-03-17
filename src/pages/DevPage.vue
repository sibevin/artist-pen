<script setup lang="ts">
import { ref } from "vue";
import { useMeta } from "vue-meta";
import { mdiMenu, mdiBookshelf } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import { LocaleActor } from "~/services/locale";
import ContentGallery from "~/dwdy/feature/sound/components/ContentGallery.vue";
import AudioPlayer from "~/dwdy/feature/sound/components/AudioPlayer.vue";
import testMp3 from "~/assets/audio/test.mp3";
import test2Mp3 from "~/assets/audio/test2.mp3";
const la = new LocaleActor("app");
useMeta({
  title: "Dev",
});
const audioSrc = ref<string | undefined>(testMp3);

function switchAudioSrc(): void {
  if (audioSrc.value === testMp3) {
    audioSrc.value = undefined;
  } else {
    audioSrc.value = testMp3;
  }
}
</script>

<template>
  <MainLayout>
    <div>Dev</div>
    <button class="btn" @click="switchAudioSrc">Switch audio</button>
    <div class="m-2">
      <AudioPlayer :audio-data="audioSrc" class="grow"></AudioPlayer>
    </div>
    <template #header-title>
      {{ la.t("app.serviceName") }}
    </template>
    <template #layout-overlay-bottom-panel>
      <div
        class="w-full border-base-100 backdrop-blur-sm bg-base-100/60 flex justify-between items-center p-3"
      >
        <label for="whole-drawer" class="btn btn-circle btn-ghost rounded-full">
          <SvgIcon
            class="text-base-content"
            icon-set="mdi"
            :path="mdiMenu"
            :size="24"
          ></SvgIcon>
        </label>
        <div class="grow flex justify-center items-center mx-2">
          <RouterLink
            to="/"
            class="btn btn-ghost rounded-full flex items-center"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiBookshelf"
              :size="24"
            ></SvgIcon>
            {{ la.t("dwdy.core.menu.shelf") }}
          </RouterLink>
        </div>
      </div>
    </template>
  </MainLayout>
</template>
