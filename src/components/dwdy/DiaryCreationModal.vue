<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useFocus } from "@vueuse/core";
import { mdiPlus, mdiCheck, mdiClose, mdiArrowLeftBottom } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { Diary, DiaryAttrs, DEFAULT_ATTRS } from "~/models/dwdy/diary";
import { DiaryFeature, featureOpts } from "~/models/dwdy/feature";
import { DiaryLayout, layoutOpts } from "~/models/dwdy/layout";
import SvgIcon from "~/components/SvgIcon.vue";
import ModalBase from "~/components/ModalBase.vue";
import { PageNavigator, NavCellSpec } from "~/services/pageNavigator";

interface Props {
  modelValue: boolean;
  fromPageScope: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "change", value: string): void;
}>();

const la = new LocaleActor("pages.dwdy.DiariesPage");
const appState = useAppState();
const router = useRouter();
const newDiaryAttrs = ref<DiaryAttrs>(Object.assign({}, DEFAULT_ATTRS));
const isModalOn = ref(false);
const diaryCreationModel = ref();
const pageScope = "diary-creation-modal";
const diaryTitleInputScope = "diary-title-input";
const newDiaryTitleInput = ref();
const { focused: isNewDiaryTitleInputFocused } = useFocus(newDiaryTitleInput);

const navCellSpecs: NavCellSpec[] = [];
const navMaxCol = Math.max(layoutOpts(la).length, featureOpts(la).length);
navCellSpecs.push({
  cell: {
    name: "diary-title-input",
    start: [0, 0],
    end: [navMaxCol + 1, 1],
  },
  callback: {
    trigger: () => {
      isNewDiaryTitleInputFocused.value = !isNewDiaryTitleInputFocused.value;
      appState.hk.value.block();
      pn.value.resetCurrent();
    },
  },
});
layoutOpts(la).forEach((layoutOpt, index) => {
  navCellSpecs.push({
    cell: {
      name: `layout-${layoutOpt.value}-radio`,
      start: [index, 1],
      end: [index + 1, 2],
    },
    callback: {
      trigger: () => {
        newDiaryAttrs.value.layout = layoutOpt.value as DiaryLayout;
      },
    },
  });
});
featureOpts(la).forEach((featureOpt, index) => {
  navCellSpecs.push({
    cell: {
      name: `feature-${featureOpt.value}-checkbox`,
      start: [index, 2],
      end: [index + 1, 3],
    },
    callback: {
      trigger: () => {
        if (isFeatureSelected(featureOpt.value)) {
          const foundIndex = newDiaryAttrs.value.enabledFeatures.indexOf(
            featureOpt.value as DiaryFeature
          );
          if (foundIndex >= 0) {
            newDiaryAttrs.value.enabledFeatures.splice(foundIndex, 1);
          }
        } else {
          newDiaryAttrs.value.enabledFeatures.push(
            featureOpt.value as DiaryFeature
          );
        }
      },
    },
  });
});
navCellSpecs.push({
  cell: {
    name: "confirm-btn",
    start: [0, 3],
    end: [navMaxCol - 1, 4],
  },
  callback: {
    trigger: () => {
      onDiaryCreationSubmitted();
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "cancel-btn",
    start: [navMaxCol - 1, 3],
    end: [navMaxCol, 4],
  },
  callback: {
    trigger: () => {
      closeModal();
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "close-btn",
    start: [0, 4],
    end: [navMaxCol - 1, 5],
  },
  callback: {
    trigger: () => {
      closeModal();
    },
  },
});
navCellSpecs.push({
  cell: {
    name: "help-btn",
    start: [navMaxCol - 1, 4],
    end: [navMaxCol, 5],
  },
  callback: {
    trigger: () => {
      console.log("help-btn");
    },
  },
});

const pn = ref<PageNavigator>(new PageNavigator(navCellSpecs));
appState.hk.value.registerPageNavigatorKeys(
  pn.value as PageNavigator,
  pageScope
);
appState.hk.value.registerKey({
  keys: ["0"],
  scope: pageScope,
  callback: () => {
    isNewDiaryTitleInputFocused.value = true;
  },
});
appState.hk.value.registerKey({
  keys: ["1"],
  scope: pageScope,
  callback: () => {
    pn.value.resetCurrent("layout-calendar-radio");
  },
});
appState.hk.value.registerKey({
  keys: ["2"],
  scope: pageScope,
  callback: () => {
    pn.value.resetCurrent("feature-essay-checkbox");
  },
});
appState.hk.value.registerKey({
  keys: ["x"],
  scope: pageScope,
  callback: () => {
    closeModal();
  },
});
appState.hk.value.registerKey({
  keys: ["v"],
  scope: pageScope,
  callback: () => {
    onDiaryCreationSubmitted();
  },
});
appState.hk.value.registerKey({
  keys: ["Enter", "Escape"],
  scope: diaryTitleInputScope,
  callback: () => {
    isNewDiaryTitleInputFocused.value = false;
  },
});

onMounted(() => {
  isModalOn.value = props.modelValue;
  pn.value.resetCurrent();
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
  }
);

watch(
  () => isModalOn.value,
  () => {
    triggerModelUpdate();
    pn.value.resetCurrent();
  }
);

watch(
  () => isNewDiaryTitleInputFocused.value,
  () => {
    if (isNewDiaryTitleInputFocused.value) {
      appState.hk.value.switchScope(diaryTitleInputScope);
      pn.value.resetCurrent();
    } else {
      appState.hk.value.switchScope(pageScope);
    }
  }
);

function closeModal() {
  isModalOn.value = false;
}

function triggerModelUpdate() {
  if (isModalOn.value) {
    appState.hk.value.switchScope(pageScope);
  } else {
    appState.hk.value.switchScope(props.fromPageScope);
  }
  if (diaryCreationModel.value) {
    emit("update:modelValue", isModalOn.value);
  }
}

function isFeatureSelected(value: string): boolean {
  return newDiaryAttrs.value.enabledFeatures.includes(value as DiaryFeature);
}

const modalCurrentSelectedBtn = computed<string | undefined>(() => {
  if (pn.value.isCurrent("close-btn")) {
    return "close";
  }
  if (pn.value.isCurrent("help-btn")) {
    return "help";
  }
  return undefined;
});

async function onDiaryCreationSubmitted(): Promise<void> {
  const newDiary = new Diary(newDiaryAttrs.value);
  const res = await newDiary.save();
  router.push({ name: "diary", params: { uid: res.target.uid } });
}
</script>

<template>
  <ModalBase
    ref="diaryCreationModel"
    v-model="isModalOn"
    class="fixed z-10"
    :modal-base-id="pageScope"
    :current-selected-btn="modalCurrentSelectedBtn"
    :show-hotkey-hint="appState.hk.value.isMarkShown(pageScope)"
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
        <div class="flex items-center">
          <label
            class="grow"
            :class="pn.isCurrent('diary-title-input') ? 'input-group' : ''"
          >
            <input
              ref="newDiaryTitleInput"
              v-model="newDiaryAttrs.title"
              class="input input-bordered border-base-200 w-full"
              :class="pn.isCurrent('diary-title-input') ? 'border-4' : ''"
              type="text"
              name="title"
              :placeholder="la.t('models.dwdy.diary.field.title') as string"
            />
            <span
              class="bg-base-200 px-2"
              :class="pn.isCurrent('diary-title-input') ? '' : 'hidden'"
            >
              <SvgIcon
                icon-set="mdi"
                :path="mdiArrowLeftBottom"
                :size="20"
              ></SvgIcon>
            </span>
          </label>
          <span
            v-if="appState.hk.value.isMarkShown(pageScope)"
            class="hotkey-mark mx-4"
            >0</span
          >
        </div>
        <div class="cell-block mt-6 mb-2 max-w-md">
          <div class="cell-title">
            {{ la.t("models.dwdy.diary.field.layout") }}
          </div>
          <div class="cell-sub-title">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="hotkey-mark"
              >1</span
            >
          </div>
          <div class="p-5 pb-2">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label
                v-for="opt in layoutOpts(la)"
                :key="opt.value"
                class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                :class="{
                  'bg-base-200': newDiaryAttrs.layout === opt.value,
                  'border-base-200 border-4':
                    newDiaryAttrs.layout !== opt.value &&
                    pn.isCurrent(`layout-${opt.value}-radio`),
                  'border-primary border-4':
                    newDiaryAttrs.layout === opt.value &&
                    pn.isCurrent(`layout-${opt.value}-radio`),
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
          <div v-for="opt in layoutOpts(la)" :key="opt.value">
            <div
              v-if="newDiaryAttrs.layout === opt.value"
              class="p-5 pt-0 input-hint-block"
            >
              {{ la.t(`models.dwdy.diary.hint.layout.${opt.value}`) }}
            </div>
          </div>
        </div>
        <div class="cell-block mt-6 mb-2 max-w-md">
          <div class="cell-title">
            {{ la.t("models.dwdy.diary.field.enabledFeatures") }}
          </div>
          <div class="cell-sub-title">
            <span
              v-if="appState.hk.value.isMarkShown(pageScope)"
              class="hotkey-mark"
              >2</span
            >
          </div>
          <div class="p-5">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label
                v-for="opt in featureOpts(la)"
                :key="opt.value"
                class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                :class="{
                  'bg-base-200': isFeatureSelected(opt.value),
                  'border-base-200 border-4':
                    !isFeatureSelected(opt.value) &&
                    pn.isCurrent(`feature-${opt.value}-checkbox`),
                  'border-primary border-4':
                    isFeatureSelected(opt.value) &&
                    pn.isCurrent(`feature-${opt.value}-checkbox`),
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
        <div class="card-actions my-3 items-center">
          <div class="grow flex items-center">
            <div class="indicator">
              <span
                v-if="appState.hk.value.isMarkShown(pageScope)"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >v</span
              >
              <button
                class="btn btn-primary"
                :class="{
                  'border-base-200 border-4': pn.isCurrent('confirm-btn'),
                }"
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
            </div>
            <div class="indicator ml-2">
              <span
                v-if="appState.hk.value.isMarkShown(pageScope)"
                class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
                >x</span
              >
              <label
                class="btn btn-ghost"
                :class="{
                  'bg-base-200': pn.isCurrent('cancel-btn'),
                }"
                :for="`modal-base_${pageScope}`"
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
      </div>
    </template>
  </ModalBase>
</template>
