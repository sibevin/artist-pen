<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { onKeyStroke, onKeyUp, onKeyDown, useFocus } from "@vueuse/core";
import { useMeta } from "vue-meta";
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
import { elRdBook } from "~/services/iconSetPath";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DwdyConfig } from "~/models/dwdy/config";
import { Diary, DiaryAttrs, DEFAULT_ATTRS } from "~/models/dwdy/diary";
import { DiarySortedBy, diarySortedByOpts } from "~/models/dwdy/diarySortedBy";
import {
  DiaryFeature,
  featureIconMap,
  featureOpts,
} from "~/models/dwdy/feature";
import { layoutOpts } from "~/models/dwdy/layout";
import { Icon } from "~/models/app/types";
import { dIndexToDtStr } from "~/models/dwdy/dateUtils";
import SvgIcon from "~/components/SvgIcon.vue";
import MainLayout from "~/layouts/MainLayout.vue";
import ModalBase from "~/components/ModalBase.vue";
import ModalSelector from "~/components/ModalSelector.vue";
import { dispatchAuth } from "~/services/flow/auth";
import * as BuildInfo from "~/services/buildInfo";

useMeta({
  title: "Diaries",
});

await dispatchAuth();

const la = new LocaleActor("pages.dwdy.DiariesPage");
const dwdyState = useDwdyState();
const router = useRouter();

const dwdyConfig = computed<DwdyConfig>(() => {
  return dwdyState.config.value;
});

const diaries = ref<Diary[]>(
  await Diary.list({ sortedBy: dwdyConfig.value.doc.diariesSortedBy })
);
const currentDiarySortedBy = ref(dwdyConfig.value.doc.diariesSortedBy);
const queryKeyword = ref("");
const newDiaryAttrs = ref<DiaryAttrs>(Object.assign({}, DEFAULT_ATTRS));
const isDiaryCreationMoodalOn = ref(false);
const isDiariesSortingMoodalOn = ref(false);
const isDiaryFeatureHelpMoodalOn = ref(false);
const inHotkeyMode = ref(false);
const currentActive = ref<number>();

const diaryList = ref();
const diaryListEntries = ref();
const queryInput = ref();
const newDiaryTitleInput = ref();
const { focused: isQueryInputFocused } = useFocus(queryInput);
const { focused: isNewDiaryTitleInputFocused } = useFocus(newDiaryTitleInput);

const isHotkeyDisabled = computed<boolean>(() => {
  return isQueryInputFocused.value || isNewDiaryTitleInputFocused.value;
});

async function updateDiaries(): Promise<void> {
  if (currentActive.value) {
    currentActive.value = 0;
  }
  diaries.value = await Diary.list({
    sortedBy: dwdyConfig.value.doc.diariesSortedBy,
    keyword: queryKeyword.value,
  });
}

onKeyDown("Alt", (e) => {
  if (BuildInfo.platform === "desktop") {
    inHotkeyMode.value = true;
    e.preventDefault();
  }
});

onKeyUp("Alt", (e) => {
  if (BuildInfo.platform === "desktop") {
    inHotkeyMode.value = false;
    e.preventDefault();
  }
});

function moveDiaryListScroll(): void {
  if (currentActive.value != undefined) {
    const targetEle = diaryListEntries.value[currentActive.value];
    if (targetEle) {
      const eleBcr = targetEle.getBoundingClientRect();
      const listBcr = diaryList.value.getBoundingClientRect();
      diaryList.value.scrollBy({
        top: eleBcr.top - listBcr.top - 16,
        behavior: "smooth",
      });
    }
  }
}

onKeyStroke(["k", "ArrowUp"], () => {
  if (isHotkeyDisabled.value || isDiariesSortingMoodalOn.value) {
    return;
  }
  if (currentActive.value != undefined) {
    if (currentActive.value - 1 < 0) {
      currentActive.value = diaries.value.length - 1;
    } else {
      currentActive.value = (currentActive.value - 1) % diaries.value.length;
    }
  } else {
    currentActive.value = 0;
  }
  moveDiaryListScroll();
});

onKeyStroke(["j", "ArrowDown"], () => {
  if (isHotkeyDisabled.value || isDiariesSortingMoodalOn.value) {
    return;
  }
  if (currentActive.value != undefined) {
    currentActive.value = (currentActive.value + 1) % diaries.value.length;
  } else {
    currentActive.value = 0;
  }
  moveDiaryListScroll();
});

onKeyStroke("Enter", () => {
  if (isQueryInputFocused.value) {
    isQueryInputFocused.value = false;
    currentActive.value = 0;
    return;
  }
  if (isHotkeyDisabled.value || isDiariesSortingMoodalOn.value) {
    return;
  }
  if (currentActive.value != undefined) {
    router.push({
      path: `/dwdy/diary/${diaries.value[currentActive.value].doc.dUid}`,
    });
  }
});

onKeyStroke("/", (e) => {
  if (queryInput.value) {
    isQueryInputFocused.value = !isQueryInputFocused.value;
  }
  if (isHotkeyDisabled.value) {
    inHotkeyMode.value = false;
    currentActive.value = undefined;
  } else {
    currentActive.value = 0;
  }
  e.preventDefault();
});

onKeyStroke("s", () => {
  if (isHotkeyDisabled.value) {
    return;
  }
  isDiariesSortingMoodalOn.value = !isDiariesSortingMoodalOn.value;
});

onKeyStroke("n", () => {
  if (isHotkeyDisabled.value) {
    return;
  }
  isDiaryCreationMoodalOn.value = !isDiaryCreationMoodalOn.value;
});

onKeyStroke("q", () => {
  if (isHotkeyDisabled.value) {
    return;
  }
  if (isDiariesSortingMoodalOn.value) {
    isDiariesSortingMoodalOn.value = false;
  } else if (isDiaryCreationMoodalOn.value) {
    isDiaryCreationMoodalOn.value = false;
  }
});

onKeyStroke("Escape", () => {
  isQueryInputFocused.value = false;
  isNewDiaryTitleInputFocused.value = false;
  currentActive.value = 0;
});

onKeyStroke(".", () => {
  if (isHotkeyDisabled.value) {
    return;
  }
  inHotkeyMode.value = !inHotkeyMode.value;
});

watch(
  () => currentDiarySortedBy.value,
  () => updateDiaries()
);

watch(
  () => queryKeyword.value,
  () => updateDiaries()
);

function getFeatureIcon(feature: DiaryFeature): Icon {
  return featureIconMap[feature];
}

function onDiarySortingBtnClicked(): void {
  isDiariesSortingMoodalOn.value = true;
}

async function onDiarySortingChanged(value: string): Promise<void> {
  currentDiarySortedBy.value = value as DiarySortedBy;
  dwdyConfig.value.assign({ diariesSortedBy: currentDiarySortedBy.value });
  await dwdyConfig.value.save();
}

async function onDiaryCreationSubmitted(): Promise<void> {
  const newDiary = new Diary(newDiaryAttrs.value);
  const res = await newDiary.save();
  router.push({
    path: `/dwdy/diary/${res.target.doc.dUid}`,
  });
}
</script>

<template>
  <MainLayout>
    <div
      ref="diaryList"
      class="absolute inset-0 flex flex-col p-3 pb-20 overflow-y-auto"
    >
      <div
        v-for="(diary, index) in diaries"
        :key="index"
        ref="diaryListEntries"
      >
        <RouterLink
          :to="'/dwdy/diary/' + diary.doc.dUid"
          class="mb-3 p-5 flex flex-col justify-between"
          :class="{ 'border-2 border-base-200': currentActive === index }"
        >
          <div class="flex mb-2">
            <SvgIcon
              class="mr-2 flex-none"
              icon-set="el"
              :path="elRdBook"
              :size="32"
            ></SvgIcon>
            <div class="text-2xl whitespace-normal">
              {{ diary.doc.title }}
            </div>
          </div>
          <div class="text-base-600 flex items-center">
            <SvgIcon
              v-if="diary.doc.lastDIndex"
              class="mr-2"
              icon-set="mdi"
              :path="mdiClockOutline"
              :size="24"
            ></SvgIcon>
            <div v-if="diary.doc.lastDIndex" class="mr-6 text-xl text-base-600">
              {{ dIndexToDtStr(diary.doc.lastDIndex) }}
            </div>
            <div class="text-base-200 flex items-center">
              <SvgIcon
                v-for="feature in diary.doc.enabledFeatures"
                :key="feature"
                class="mr-3"
                :icon-set="getFeatureIcon(feature).set"
                :path="getFeatureIcon(feature).path"
                :size="20"
              ></SvgIcon>
            </div>
          </div>
        </RouterLink>
      </div>
      <button
        type="button"
        class="w-full rounded border-2 border-dashed border-base-300 p-6 flex flex-col justify-center items-center"
        @click="isDiaryCreationMoodalOn = true"
      >
        <SvgIcon
          class="mb-3 text-base-200"
          icon-set="el"
          :path="elRdBook"
          :size="54"
        ></SvgIcon>
        <div class="indicator">
          <div
            v-if="inHotkeyMode"
            class="indicator-item indicator-middle -mr-6 hotkey-mark"
          >
            n
          </div>
          <div class="text-lg flex items-center text-base-300">
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiPlus"
              :size="24"
            ></SvgIcon>
            {{ la.t(".newDiary") }}
          </div>
        </div>
      </button>
    </div>
    <template #header-title>
      {{ la.t("app.serviceName") }}
    </template>
    <template #header-panel>
      <div class="page-mark">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiBookshelf"
          :size="20"
        ></SvgIcon>
        <div class="text-xs">
          {{ la.t("dwdy.menu.shelf") }}
        </div>
      </div>
    </template>
    <template #layout-overlay-bottom-panel>
      <div
        class="select-none w-full border-base-100 backdrop-blur-sm bg-base-100/80 flex justify-between items-center p-3"
      >
        <div class="indicator">
          <span
            v-if="inHotkeyMode"
            class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
            >m</span
          >
          <label
            for="whole-drawer"
            class="btn btn-circle btn-ghost rounded-full"
          >
            <SvgIcon
              class="text-base-content"
              icon-set="mdi"
              :path="mdiMenu"
              :size="24"
            ></SvgIcon>
          </label>
        </div>
        <div class="grow flex justify-center items-center">
          <div class="indicator mr-2">
            <span
              v-if="inHotkeyMode"
              class="indicator-item indicator-bottom hotkey-mark"
              >/</span
            >
            <div class="form-control">
              <label class="input-group input-group-sm">
                <span class="bg-base-200 px-1">
                  <SvgIcon
                    icon-set="mdi"
                    :path="mdiMagnify"
                    :size="24"
                  ></SvgIcon>
                </span>
                <input
                  ref="queryInput"
                  v-model="queryKeyword"
                  type="text"
                  :placeholder="la.t('.queryKeywordHint') as string"
                  class="input input-bordered input-sm border-base-200 w-28"
                />
              </label>
            </div>
          </div>
          <div class="indicator">
            <span
              v-if="inHotkeyMode"
              class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
              >s</span
            >
            <div v-for="opt in diarySortedByOpts(la)" :key="opt.value">
              <button
                v-if="(currentDiarySortedBy as DiarySortedBy) === opt.value"
                class="btn btn-ghost rounded-full flex items-center"
                @click="onDiarySortingBtnClicked"
              >
                <SvgIcon
                  v-if="opt.icon"
                  class="mr-2"
                  :icon-set="opt.icon.set"
                  :path="opt.icon.path"
                  :size="24"
                ></SvgIcon>
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #layout-top-layer>
      <ModalBase
        v-model="isDiaryCreationMoodalOn"
        class="fixed z-10"
        modal-base-id="diary-index-creation"
        :help-btn-enabled="true"
        @trigger-help="isDiaryFeatureHelpMoodalOn = true"
      >
        <template #modal-title>
          <div>
            <h2 class="card-title mb-2">
              <SvgIcon
                class="text-base-content mr-1"
                icon-set="mdi"
                :path="mdiPlus"
                :size="24"
              ></SvgIcon>
              {{ la.t(".newDiary") }}
            </h2>
          </div>
        </template>
        <template #modal-content>
          <div>
            <input
              ref="newDiaryTitleInput"
              v-model="newDiaryAttrs.title"
              class="input input-bordered border-base-200 w-full"
              type="text"
              name="title"
              :placeholder="la.t('models.dwdy.diary.field.title') as string"
            />
            <div class="cell-block mt-6 mb-2 max-w-md">
              <div class="cell-title">
                {{ la.t("models.dwdy.diary.field.layout") }}
              </div>
              <div class="p-5 flex justify-between items-center">
                <label
                  v-for="opt in layoutOpts(la)"
                  :key="opt.value"
                  class="flex-1 mr-2 last:mr-0 p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                  :class="{
                    'bg-base-200': newDiaryAttrs.layout === opt.value,
                  }"
                >
                  <input
                    v-model="newDiaryAttrs.layout"
                    type="radio"
                    name="layout"
                    class="hidden"
                    :value="opt.value"
                  />
                  <SvgIcon
                    v-if="opt.icon"
                    class="mb-2"
                    :icon-set="opt.icon.set"
                    :path="opt.icon.path"
                    :size="32"
                  ></SvgIcon>
                  <div>{{ opt.label }}</div>
                </label>
              </div>
            </div>
            <div class="cell-block mt-6 mb-2 max-w-md">
              <div class="cell-title">
                {{ la.t("models.dwdy.diary.field.enabledFeatures") }}
              </div>
              <div class="cell-sub-title">
                <button
                  class="flex justify-center items-center h-6 pointer"
                  @click="isDiaryFeatureHelpMoodalOn = true"
                >
                  <SvgIcon
                    class="text-base-200"
                    icon-set="mdi"
                    :path="mdiHelpCircle"
                    :size="18"
                  ></SvgIcon>
                </button>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-center">
                  <label
                    v-for="opt in featureOpts(la)"
                    :key="opt.value"
                    class="flex-1 mr-2 last:mr-0 p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                    :class="{
                        'bg-base-200': newDiaryAttrs.enabledFeatures.includes(
                          opt.value as DiaryFeature
                        ),
                      }"
                  >
                    <input
                      v-model="newDiaryAttrs.enabledFeatures"
                      type="checkbox"
                      name="enabledFeatures"
                      class="hidden"
                      :value="opt.value"
                    />
                    <SvgIcon
                      v-if="opt.icon"
                      class="mb-2"
                      :icon-set="opt.icon.set"
                      :path="opt.icon.path"
                      :size="32"
                    ></SvgIcon>
                    <div>{{ opt.label }}</div>
                  </label>
                </div>
              </div>
            </div>
            <div class="input-hint-block">
              {{ la.t(".creationHint") }}
            </div>
            <div class="card-actions mt-3 items-center">
              <div class="grow flex items-center">
                <button
                  class="btn btn-primary"
                  @click="onDiaryCreationSubmitted"
                >
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
                  for="modal-base_diary-index-creation"
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
      <ModalSelector
        v-model="isDiariesSortingMoodalOn"
        modal-id="locale-selector"
        :current-value="currentDiarySortedBy"
        :options="diarySortedByOpts(la)"
        :icon-enabled="true"
        :in-hotkey-mode="inHotkeyMode"
        @change="onDiarySortingChanged"
      >
        <template #modal-title>
          <h2 class="card-title mb-4">
            <SvgIcon
              class="mr-1"
              icon-set="mdi"
              :path="mdiSortAscending"
              :size="24"
            ></SvgIcon>
            {{ la.t("models.dwdy.config.field.diariesSortedBy") }}
            <div v-if="inHotkeyMode">
              <div class="hotkey-mark mx-2">s</div>
            </div>
          </h2>
        </template>
      </ModalSelector>
      <ModalBase
        v-model="isDiaryFeatureHelpMoodalOn"
        class="fixed z-10"
        modal-base-id="diary-index-diary-feature-help"
      >
        <template #modal-title>
          <div>
            <h2 class="card-title mb-2">
              <SvgIcon
                class="text-base-content mr-1"
                icon-set="mdi"
                :path="mdiHelpCircle"
                :size="24"
              ></SvgIcon>
              {{ la.t("models.dwdy.diary.field.enabledFeatures") }}
            </h2>
          </div>
        </template>
        <template #modal-content>
          <div>
            <div class="mt-3">
              {{ la.t("models.dwdy.diary.hint.enabledFeatures") }}
            </div>
            <div class="card-actions mt-6 items-center">
              <div class="grow flex items-center">
                <label
                  for="modal-base_diary-index-diary-feature-help"
                  class="btn btn-primary"
                >
                  <SvgIcon
                    class="mr-2"
                    icon-set="mdi"
                    :path="mdiClose"
                    :size="16"
                  ></SvgIcon>
                  {{ la.t("app.action.close") }}
                </label>
              </div>
            </div>
          </div>
        </template>
      </ModalBase>
    </template>
  </MainLayout>
</template>
