<script setup lang="ts">
import { mdiMenu, mdiBookshelf, mdiAccountBox } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import { LocaleActor } from "~/services/locale";
const la = new LocaleActor("app");
</script>

<template>
  <MainLayout menu-hotkey-scope="account">
    <div>Account</div>
    <template #header-title>
      {{ la.t(".serviceName") }}
    </template>
    <template #header-panel>
      <div class="page-mark">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiAccountBox"
          :size="20"
        ></SvgIcon>
        <div class="text-xs">
          {{ la.t(".menu.account") }}
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
            {{ la.t("dwdy.core.menu.shelf") }}
          </RouterLink>
        </div>
      </div>
    </template>
  </MainLayout>
</template>
