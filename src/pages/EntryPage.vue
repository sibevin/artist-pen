<script setup lang="ts">
import { useMeta } from "vue-meta";
import { mdiMenu, mdiBookshelf } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import { LocaleActor } from "~/services/locale";
import { dispatchEntry } from "~/services/flow/auth";

useMeta({
  title: "Entry",
});

const la = new LocaleActor("app");

await dispatchEntry();
</script>

<template>
  <MainLayout menu-hotkey-scope="entry">
    <div></div>
    <template #layout-overlay-bottom-panel>
      <div
        class="select-none w-full border-base-100 backdrop-blur-sm bg-base-100/80 flex justify-between items-center p-3"
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
