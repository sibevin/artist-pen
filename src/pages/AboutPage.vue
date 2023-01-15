<script setup lang="ts">
import { ref } from "vue";
import { useMeta } from "vue-meta";
import { mdiMenu, mdiBookshelf, mdiStar } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import { LocaleActor } from "~/services/locale";
import { HotkeyProvider } from "~/services/hotkeyProvider";
const la = new LocaleActor("app");
useMeta({
  title: "About",
});

const hk = ref<HotkeyProvider>(new HotkeyProvider());

hk.value.initDefaultHotKeys();
hk.value.activated = true;
hk.value.switchScope("about");

function changeScope(givenScope: string) {
  hk.value.switchScope(givenScope);
}
</script>

<template>
  <MainLayout menu-hotkey-scope="about">
    <div>About</div>
    <div>{{ hk.scope }}</div>
    <div>{{ hk.inHotkeyMode }}</div>
    <div>hk.isMarkShown('about'): {{ hk.isMarkShown("about") }}</div>
    <button class="btn" @click="changeScope('none')">None</button>
    <button class="btn" @click="changeScope('about')">About</button>
    <template #header-title>
      {{ la.t(".serviceName") }}
    </template>
    <template #header-panel>
      <div class="page-mark">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiStar"
          :size="20"
        ></SvgIcon>
        <div class="text-xs">
          {{ la.t(".menu.about") }}
        </div>
      </div>
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
            {{ la.t("dwdy.menu.shelf") }}
          </RouterLink>
        </div>
      </div>
    </template>
  </MainLayout>
</template>
