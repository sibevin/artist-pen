<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { mdiFileEditOutline } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureComponent } from "~/dwdy/feature/component";
import { DiaryContentFeatureIndex } from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import DiaryEditorFeatureSelectorModal from "~/components/dwdy/diaryEditor/FeatureSelectorModal.vue";
import DiaryEditorPositionChangeModal from "~/components/dwdy/diaryEditor/PositionChangeModal.vue";
import DiaryEditorDeletionModal from "~/components/dwdy/diaryEditor/DeletionModal.vue";
import DiaryEditorJumpModal from "~/components/dwdy/diaryEditor/JumpModal.vue";
import ControlMenu from "~/components/dwdy/diaryEditor/ControlMenu.vue";
import {
  initDwdyStateByRoute,
  insertEntryByRoute,
} from "~/dwdy/services/initDwdyStateByRoute";

const route = useRoute();
const router = useRouter();
const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryEditorPage");
const pageScope = ref<string>("diaryEdit");
const currentFeature = ref<DiaryFeature>(DiaryFeature.Text);
const currentContentCount = ref(0);
const currentContentIndex = ref(0);

const mainLayout = ref();
const isFeatureSelectorModalOn = ref(false);
const isPositionChangeModalOn = ref(false);
const isDeletionModalOn = ref(false);
const isJumpModalOn = ref(false);
const contentEditor = ref();

await initPage();

async function initPage(): Promise<void> {
  if (!(await initDwdyStateByRoute(dwdyState, route))) {
    router.push({ name: "diaries" });
  }
  if (!(await insertEntryByRoute(dwdyState, route))) {
    router.push({
      name: "diary",
      params: { dUid: dwdyState.diary.value.doc.dUid },
    });
  }
  currentFeature.value = (route.query.f as DiaryFeature) || DiaryFeature.Text;
  currentContentIndex.value = parseInt(route.query.ci as string) || 0;
}

watch(
  () => [dwdyState.entry.value, currentFeature.value],
  () => {
    updateContentCount();
  }
);

updateContentCount();

function updateContentCount(): void {
  currentContentCount.value = dwdyState.entry.value.fetchContents(
    currentFeature.value
  ).length;
}

function onEditorSelectorToggled(): void {
  isFeatureSelectorModalOn.value = true;
}

function onFeatureSelected(cfi: DiaryContentFeatureIndex): void {
  currentFeature.value = cfi.feature;
  updateContentCount();
  onContentSelected(0);
}

function onContentSelected(index: number): void {
  currentContentIndex.value = index;
}

function onDeletionDone(index: number): void {
  updateContentCount();
  onContentSelected(index);
}

function onCreationDone(moveToIndex: number | "last" | undefined): void {
  updateContentCount();
  if (moveToIndex === undefined) {
    return;
  }
  if (moveToIndex === "last") {
    onContentSelected(currentContentCount.value - 1);
    return;
  }
  onContentSelected(moveToIndex);
}
</script>

<template>
  <MainLayout ref="mainLayout">
    <div class="relatvie top-0 bottom-0 w-full h-full">
      <component
        :is="featureComponent(currentFeature, 'editorMain')"
        ref="contentEditor"
        :content-count="currentContentCount"
        :content-index="currentContentIndex"
        @toggle-jump="isJumpModalOn = true"
        @select-index="onContentSelected"
        @creation-done="onCreationDone"
      ></component>
    </div>
    <template #header-title>
      <component
        :is="dwdyState.diary.value.layoutComponent('titlePanel')"
      ></component>
    </template>
    <template #header-panel>
      <div class="page-mark">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiFileEditOutline"
          :size="20"
        ></SvgIcon>
        <div class="text-xs">
          {{ la.t("app.action.edit") }}
        </div>
      </div>
    </template>
    <template #layout-fixed-bottom-panel>
      <ControlMenu
        :feature="currentFeature"
        :hotkey-scope="pageScope"
        @toggle-feature-selection="onEditorSelectorToggled"
      >
        <template #main-menu>
          <component
            :is="featureComponent(currentFeature, 'editorMenu')"
            :content-count="currentContentCount"
            @toggle-deletion="isDeletionModalOn = true"
            @toggle-position-change="isPositionChangeModalOn = true"
          ></component>
        </template>
      </ControlMenu>
    </template>
    <template #layout-top-layer>
      <DiaryEditorFeatureSelectorModal
        v-model="isFeatureSelectorModalOn"
        class="fixed z-10"
        @select="onFeatureSelected"
      ></DiaryEditorFeatureSelectorModal>
      <DiaryEditorPositionChangeModal
        v-model="isPositionChangeModalOn"
        :feature="currentFeature"
        :content-count="currentContentCount"
        :content-index="currentContentIndex"
        @done="onContentSelected"
      ></DiaryEditorPositionChangeModal>
      <DiaryEditorDeletionModal
        v-model="isDeletionModalOn"
        :feature="currentFeature"
        :content-count="currentContentCount"
        :content-index="currentContentIndex"
        @done="onDeletionDone"
      ></DiaryEditorDeletionModal>
      <DiaryEditorJumpModal
        v-model="isJumpModalOn"
        :feature="currentFeature"
        :content-count="currentContentCount"
        :content-index="currentContentIndex"
        @done="onContentSelected"
      ></DiaryEditorJumpModal>
    </template>
  </MainLayout>
</template>
