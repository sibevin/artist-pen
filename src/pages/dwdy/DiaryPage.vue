<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { onKeyStroke } from "@vueuse/core";
import {
  mdiPlus,
  mdiMagnify,
  mdiClockOutline,
  mdiMenu,
  mdiCheck,
  mdiClose,
  mdiBookshelf,
  mdiSortAscending,
  mdiHelpCircle,
} from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalBase from "~/components/ModalBase.vue";
import ViewerControlMenu from "~/components/dwdy/ViewerControlMenu.vue";
import { LocaleActor } from "~/services/locale";
import { HotkeyProvider } from "~/services/hotkeyProvider";
import { Diary, DiaryAttrs, DEFAULT_ATTRS } from "~/models/dwdy/diary";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";

const route = useRoute();
const router = useRouter();
const appState = useAppState();
const dwdyState = useDwdyState();

appState.hk.value.setupHotKeys("diary-page");

const fetchedDiary = await Diary.fetch(route.params.uid as string);
if (fetchedDiary) {
  dwdyState.diary.value = fetchedDiary;
} else {
  router.push({
    path: `/dwdy/diaries`,
  });
}

const la = new LocaleActor("pages.dwdy.DiaryPage");
const isDiarySearchModalOn = ref(false);

function onBackToShelfBtnClicked() {
  router.push({
    path: `/dwdy/diaries`,
  });
}

function onSearchBtnClicked() {
  isDiarySearchModalOn.value = true;
}
</script>

<template>
  <MainLayout menu-hotkey-scope="diary">
    <template #header-title> {{ dwdyState.diary.value.doc.title }} </template>
    <template #layout-overlay-bottom-panel>
      <ViewerControlMenu
        :menu-entries="['shelf', 'edit', 'search', 'settings']"
        :is-menu-hide-btn-enabled="true"
      ></ViewerControlMenu>
    </template>
    <template #layout-top-layer>
      <ModalBase
        v-model="isDiarySearchModalOn"
        class="fixed z-10"
        modal-base-id="diary-show-search"
      >
        <template #modal-title>
          <div>
            <h2 class="card-title mb-2">
              <SvgIcon
                class="text-base-content mr-1"
                icon-set="mdi"
                :path="mdiMagnify"
                :size="24"
              ></SvgIcon>
              {{ la.t("app.action.search") }}
            </h2>
          </div>
        </template>
        <template #modal-content>
          <div>
            <div class="input-hint-block">
              {{ la.t(".creationHint") }}
            </div>
            <div class="card-actions mt-3 items-center">
              <div class="grow flex items-center">
                <button class="btn btn-primary">
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiCheck"
                    :size="16"
                  ></SvgIcon>
                  {{ la.t("app.action.create") }}
                </button>
                <label
                  class="btn btn-ghost ml-2"
                  for="modal-base_diary-show-search"
                >
                  <SvgIcon
                    class="text-base-content mr-2"
                    icon-set="mdi"
                    :path="mdiClose"
                    :size="16"
                  ></SvgIcon>
                  {{ la.t("app.action.cancel") }}
                </label>
              </div>
            </div>
          </div>
        </template>
      </ModalBase>
    </template>
  </MainLayout>
</template>
