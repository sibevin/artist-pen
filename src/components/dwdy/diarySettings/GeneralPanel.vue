<script setup lang="ts">
import { ref, watch } from "vue";
import { useFocus } from "@vueuse/core";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryParams, DiaryDocParams } from "~/models/dwdy/diary";
import { layoutComponent } from "~/dwdy/layout/component";

const emit = defineEmits<{
  (e: "triggerAction", action: string): void;
  (e: "moveAction", action: string | undefined): void;
  (e: "toggleHotkeyMark", value: boolean): void;
}>();

const la = new LocaleActor("pages.dwdy.DiaryPage.settingsModal");
const appState = useAppState();
const dwdyState = useDwdyState();
const updatedDiaryAttrs = ref<DiaryDocParams>(
  Object.assign({}, dwdyState.diary.value.doc)
);
const updatedDiaryTitleInput = ref();
const { focused: isUpdatedDiaryTitleInputFocused } = useFocus(
  updatedDiaryTitleInput
);

const hkScope = "diary-settings-general-panel";
const diaryTitleInputScope = "diary-settings-title-input";

watch(
  () => isUpdatedDiaryTitleInputFocused.value,
  () => {
    if (isUpdatedDiaryTitleInputFocused.value) {
      appState.hk.value.switchScope(diaryTitleInputScope);
    } else {
      appState.hk.value.switchScope(hkScope);
    }
  }
);

watch(
  () => appState.hk.value.isMarkShown(hkScope),
  () => {
    emit("toggleHotkeyMark", appState.hk.value.isMarkShown(hkScope));
  }
);

async function onDiaryUpdated(updatedAttrs: DiaryParams): Promise<void> {
  dwdyState.diary.value.assign(updatedAttrs);
  await dwdyState.diary.value.save();
}
</script>

<template>
  <div>
    <div class="flex items-center">
      <div class="grow">
        <div class="font-bold -mb-3 z-10 relative">
          <div class="mx-2 px-2 bg-base-100 inline-block">
            {{ la.t("models.dwdy.diary.field.title") }}
          </div>
        </div>
        <input
          ref="updatedDiaryTitleInput"
          v-model="updatedDiaryAttrs.title"
          class="input input-bordered border-base-200 w-full pt-2 h-14"
          type="text"
          name="title"
          @blur="onDiaryUpdated({ title: updatedDiaryAttrs.title })"
        />
      </div>
    </div>
    <component
      :is="layoutComponent(dwdyState.diary.value.doc.layout, 'configPanel')"
      class="mb-2"
    ></component>
  </div>
</template>
