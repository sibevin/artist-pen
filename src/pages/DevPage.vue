<script setup lang="ts">
import { ref } from "vue";
import { useMeta } from "vue-meta";
import { mdiMenu, mdiBookshelf } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import { LocaleActor } from "~/services/locale";
import DateRangeSelector from "~/components/input/DateRangeSelector.vue";

const la = new LocaleActor("app");
useMeta({
  title: "Dev",
});

function onDateRangeSelected(value: { mark: string; value: string }): void {
  console.log("select:", value);
}
</script>

<template>
  <MainLayout>
    <div class="pb-16">
      <div>Dev</div>
      <div class="m-2">
        <DateRangeSelector @select="onDateRangeSelected"></DateRangeSelector>
      </div>
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
