<script setup lang="ts">
import { ref, watch } from "vue";
import { useFocus } from "@vueuse/core";
import {
  mdiArrowLeftBottom,
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useAppState } from "~/states/useAppState";
import { useDwdyState } from "~/states/useDwdyState";
import { dbDwdy } from "~/services/db/dwdy";
import { DiaryParams, DiaryDocParams } from "~/models/dwdy/diary";
import {
  DiaryLayout,
  layoutOpts,
  TIME_BASED_LAYOUTS,
} from "~/models/dwdy/layout";

import { DiaryConfigParams } from "~/models/dwdy/config";
import {
  weekDayOpts,
  timelineOrderOpts,
  WEEK_DAYS,
  DiaryTimelineOrder,
} from "~/models/dwdy/configOption";
import SvgIcon from "~/components/SvgIcon.vue";
import { NavPoint, PageNavigator, NavCellSpec } from "~/services/pageNavigator";

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

const pn = ref<PageNavigator>(new PageNavigator([]));
const navCellSpecs: NavCellSpec[] = [];
navCellSpecs.push({
  cell: {
    name: "diary-title-input",
    start: [0, 0],
    end: [WEEK_DAYS.length + 1, 1],
  },
  callback: {
    trigger: () => {
      isUpdatedDiaryTitleInputFocused.value =
        !isUpdatedDiaryTitleInputFocused.value;
      pn.value.resetCurrent();
    },
  },
});
if (dwdyState.diary.value.isTimeBasedLayout) {
  TIME_BASED_LAYOUTS.forEach((layout, index) => {
    let start: NavPoint = [WEEK_DAYS.length - index + 1, 1];
    let end: NavPoint = [WEEK_DAYS.length - index + 2, 2];
    if (index === 0) {
      start = [0, 1];
      end = [WEEK_DAYS.length - TIME_BASED_LAYOUTS.length + 2, 2];
    }
    navCellSpecs.push({
      cell: {
        name: `layout-${layout}-radio`,
        start,
        end,
      },
      callback: {
        trigger: () => {
          updatedDiaryAttrs.value.layout = layout as DiaryLayout;
          onDiaryUpdated({ layout: updatedDiaryAttrs.value.layout });
        },
      },
    });
  });
  WEEK_DAYS.forEach((wDay, index) => {
    let start: NavPoint = [index, 2];
    let end: NavPoint = [index + 1, 3];
    if (index === 6) {
      start = [index, 2];
      end = [index + 2, 3];
    }
    navCellSpecs.push({
      cell: {
        name: `first-week-day-${wDay}-radio`,
        start,
        end,
        skip: () => {
          return updatedDiaryAttrs.value.layout !== DiaryLayout.Calendar;
        },
      },
      callback: {
        trigger: () => {
          updatedDiaryAttrs.value.firstWeekDay = wDay;
          onDiaryUpdated({
            firstWeekDay: updatedDiaryAttrs.value.firstWeekDay,
          });
        },
      },
    });
  });
  Object.values(DiaryTimelineOrder).forEach((order, index) => {
    let start: NavPoint = [WEEK_DAYS.length - index + 1, 3];
    let end: NavPoint = [WEEK_DAYS.length - index + 2, 4];
    if (index === 0) {
      start = [0, 3];
      end = [
        WEEK_DAYS.length - Object.values(DiaryTimelineOrder).length + 2,
        4,
      ];
    }
    navCellSpecs.push({
      cell: {
        name: `timeline-order-${order}-radio`,
        start,
        end,
        skip: () => {
          return updatedDiaryAttrs.value.layout !== DiaryLayout.Timeline;
        },
      },
      callback: {
        trigger: () => {
          updatedDiaryAttrs.value.timelineOrder = order as DiaryTimelineOrder;
          onDiaryUpdated({
            timelineOrder: updatedDiaryAttrs.value.timelineOrder,
          });
        },
      },
    });
  });
  WEEK_DAYS.forEach((wDay, index) => {
    navCellSpecs.push({
      cell: {
        name: `highlighted-week-days-${wDay}-checkbox`,
        start: [index, 4],
        end: [index + 1, 5],
      },
      callback: {
        trigger: () => {
          if (updatedDiaryAttrs.value.highlightedWeekDays) {
            if (updatedDiaryAttrs.value.highlightedWeekDays.includes(wDay)) {
              const foundIndex =
                updatedDiaryAttrs.value.highlightedWeekDays.indexOf(wDay);
              if (foundIndex >= 0) {
                updatedDiaryAttrs.value.highlightedWeekDays.splice(
                  foundIndex,
                  1
                );
              }
            } else {
              updatedDiaryAttrs.value.highlightedWeekDays.push(wDay);
            }
          }
          onDiaryHighlightedWeekDaysUpdated();
        },
      },
    });
  });
  navCellSpecs.push({
    cell: {
      name: `is-week-shown-toggle`,
      start: [WEEK_DAYS.length, 4],
      end: [WEEK_DAYS.length + 1, 5],
    },
    callback: {
      trigger: () => {
        updatedDiaryAttrs.value.isWeekShown =
          !updatedDiaryAttrs.value.isWeekShown;
        onDiaryUpdated({
          isWeekShown: updatedDiaryAttrs.value.isWeekShown,
        });
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-general`,
      start: [0, 5],
      end: [WEEK_DAYS.length - 1, 6],
    },
    callback: {
      enter: () => {
        emit("moveAction", "tab-general");
      },
      trigger: () => {
        emit("triggerAction", "tab-general");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-feature`,
      start: [WEEK_DAYS.length - 1, 5],
    },
    callback: {
      enter: () => {
        emit("moveAction", "tab-feature");
      },
      trigger: () => {
        emit("triggerAction", "tab-feature");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-data`,
      start: [WEEK_DAYS.length, 5],
    },
    callback: {
      enter: () => {
        emit("moveAction", "tab-data");
      },
      trigger: () => {
        emit("triggerAction", "tab-data");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
  navCellSpecs.push({
    cell: {
      name: `tab-close`,
      start: [0, 6],
      end: [WEEK_DAYS.length + 1, 7],
    },
    callback: {
      enter: () => {
        emit("moveAction", "close");
      },
      trigger: () => {
        emit("triggerAction", "close");
      },
      leave: () => {
        emit("moveAction", undefined);
      },
    },
  });
}
pn.value.resetCellSpec(navCellSpecs);

function resetPnLayoutOption(): void {
  if (dwdyState.diary.value.doc.layout === DiaryLayout.Calendar) {
    pn.value.resetCurrent("first-week-day-0-radio");
  }
  if (dwdyState.diary.value.doc.layout === DiaryLayout.Timeline) {
    pn.value.resetCurrent("timeline-order-d_index_asc-radio");
  }
}

appState.hk.value.setupHotKeys(hkScope, () => {
  appState.hk.value.registerPageNavigatorKeys(
    pn.value as PageNavigator,
    hkScope
  );
  appState.hk.value.registerKey({
    keys: ["0"],
    scope: hkScope,
    callback: () => {
      isUpdatedDiaryTitleInputFocused.value = true;
    },
  });
  appState.hk.value.registerKey({
    keys: ["Enter", "Escape"],
    scope: diaryTitleInputScope,
    callback: () => {
      isUpdatedDiaryTitleInputFocused.value = false;
    },
  });
  if (dwdyState.diary.value.isTimeBasedLayout) {
    appState.hk.value.registerKey({
      keys: ["1"],
      scope: hkScope,
      callback: () => {
        pn.value.resetCurrent("layout-calendar-radio");
      },
    });
    appState.hk.value.registerKey({
      keys: ["2"],
      scope: hkScope,
      callback: () => {
        resetPnLayoutOption();
      },
    });
    appState.hk.value.registerKey({
      keys: ["2"],
      scope: hkScope,
      callback: () => {
        resetPnLayoutOption();
      },
    });
    appState.hk.value.registerKey({
      keys: ["3"],
      scope: hkScope,
      callback: () => {
        pn.value.resetCurrent("highlighted-week-days-0-checkbox");
      },
    });
    appState.hk.value.registerKey({
      keys: ["4"],
      scope: hkScope,
      callback: () => {
        pn.value.resetCurrent("is-week-shown-toggle");
      },
    });
  }
  appState.hk.value.registerKey({
    keys: ["7"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "tab-general");
    },
  });
  appState.hk.value.registerKey({
    keys: ["8"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "tab-feature");
    },
  });
  appState.hk.value.registerKey({
    keys: ["9"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "tab-data");
    },
  });
  appState.hk.value.registerKey({
    keys: ["x"],
    scope: hkScope,
    callback: () => {
      emit("triggerAction", "close");
    },
  });
});
appState.hk.value.switchBackScope();

watch(
  () => isUpdatedDiaryTitleInputFocused.value,
  () => {
    if (isUpdatedDiaryTitleInputFocused.value) {
      appState.hk.value.switchScope(diaryTitleInputScope);
      pn.value.resetCurrent();
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

async function onDiaryHighlightedWeekDaysUpdated(): Promise<void> {
  await onDiaryUpdated({
    highlightedWeekDays: (
      updatedDiaryAttrs.value.highlightedWeekDays || []
    ).map((value) => Number(value)),
  });
}

async function onConfigUpdated(updatedAttrs: DiaryConfigParams): Promise<void> {
  dbDwdy.transaction("rw", dbDwdy.diaries, dbDwdy.configs, async () => {
    dwdyState.diary.value.assign(updatedAttrs);
    await dwdyState.diary.value.save();
    dwdyState.config.value.assign(updatedAttrs);
    await dwdyState.diary.value.save();
  });
}

async function onWeekShownToggled(): Promise<void> {
  updatedDiaryAttrs.value.isWeekShown = !updatedDiaryAttrs.value.isWeekShown;
  await onConfigUpdated({
    isWeekShown: updatedDiaryAttrs.value.isWeekShown,
  });
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
        <label :class="pn.isCurrent('diary-title-input') ? 'input-group' : ''">
          <input
            ref="updatedDiaryTitleInput"
            v-model="updatedDiaryAttrs.title"
            class="input input-bordered border-base-200 w-full pt-2 h-14"
            :class="pn.isCurrent('diary-title-input') ? 'border-4' : ''"
            type="text"
            name="title"
            @blur="onDiaryUpdated({ title: updatedDiaryAttrs.title })"
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
      </div>
      <span
        v-if="appState.hk.value.isMarkShown(hkScope)"
        class="hotkey-mark mx-4 mt-3"
        >0</span
      >
    </div>
    <div v-if="dwdyState.diary.value.isTimeBasedLayout">
      <div class="cell-block mt-6 mb-2">
        <div class="cell-title">
          {{ la.t("models.dwdy.diary.field.layout") }}
        </div>
        <div
          v-if="appState.hk.value.isMarkShown(hkScope)"
          class="cell-sub-title"
        >
          <span class="hotkey-mark">1</span>
        </div>
        <div class="p-5 pb-2">
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="opt in layoutOpts(la, TIME_BASED_LAYOUTS)"
              :key="opt.value"
              class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
              :class="{
                'bg-base-200': updatedDiaryAttrs.layout === opt.value,
                'border-primary border-4': pn.isCurrent(
                  `layout-${opt.value}-radio`
                ),
              }"
            >
              <input
                v-model="updatedDiaryAttrs.layout"
                type="radio"
                name="layout"
                class="hidden"
                :value="opt.value"
                @change="onDiaryUpdated({ layout: updatedDiaryAttrs.layout })"
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
        <div
          v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Calendar"
          class="cell-block m-3"
        >
          <div class="cell-title">
            {{ la.t("models.dwdy.config.field.firstWeekDay") }}
          </div>
          <div
            v-if="appState.hk.value.isMarkShown(hkScope)"
            class="cell-sub-title"
          >
            <span class="hotkey-mark">2</span>
          </div>
          <div class="p-5 flex justify-center items-center">
            <label
              v-for="opt in weekDayOpts(la)"
              :key="opt.value"
              class="mx-1 md:mx-2 rounded cursor-pointer flex flex-col justify-center items-center"
              :class="{
                'border-base-200 border-4 p-2': pn.isCurrent(
                  `first-week-day-${opt.value}-radio`
                ),
              }"
            >
              <input
                v-model.number="updatedDiaryAttrs.firstWeekDay"
                class="radio mb-2"
                type="radio"
                name="firstWeekDay"
                :value="opt.value"
                @change="
                  onConfigUpdated({
                    firstWeekDay: updatedDiaryAttrs.firstWeekDay,
                  })
                "
              />
              <span class="hidden md:inline">
                {{ opt.label }}
              </span>
              <span class="inline md:hidden">
                {{ opt.labelShort }}
              </span>
            </label>
          </div>
        </div>
        <div
          v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Timeline"
          class="cell-block m-3"
        >
          <div class="cell-title">
            {{ la.t("models.dwdy.config.field.timelineOrder") }}
          </div>
          <div
            v-if="appState.hk.value.isMarkShown(hkScope)"
            class="cell-sub-title"
          >
            <span class="hotkey-mark">2</span>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="opt in timelineOrderOpts(la)"
                :key="opt.value"
                class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                :class="{
                  'bg-base-200': updatedDiaryAttrs.timelineOrder === opt.value,
                  'border-primary border-4': pn.isCurrent(
                    `timeline-order-${opt.value}-radio`
                  ),
                }"
              >
                <input
                  v-model="updatedDiaryAttrs.timelineOrder"
                  type="radio"
                  name="timelineOrder"
                  class="hidden"
                  :value="opt.value"
                  @change="
                    onDiaryUpdated({
                      timelineOrder: updatedDiaryAttrs.timelineOrder,
                    })
                  "
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
      </div>
      <div class="mt-6 mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="cell-block">
          <div class="cell-title">
            {{ la.t("models.dwdy.config.field.highlightedWeekDays") }}
          </div>
          <div
            v-if="appState.hk.value.isMarkShown(hkScope)"
            class="cell-sub-title"
          >
            <span class="hotkey-mark">3</span>
          </div>
          <div class="p-5 flex justify-center items-center">
            <label
              v-for="opt in weekDayOpts(la)"
              :key="opt.value"
              class="mx-1 md:mx-2 rounded cursor-pointer flex flex-col justify-center items-center"
              :class="{
                'border-base-200 border-4 p-2': pn.isCurrent(
                  `highlighted-week-days-${opt.value}-checkbox`
                ),
              }"
            >
              <input
                v-model.number="updatedDiaryAttrs.highlightedWeekDays"
                class="checkbox mb-2"
                type="checkbox"
                name="highlightedWeekDays"
                :value="opt.value"
                @change="onDiaryHighlightedWeekDaysUpdated"
              />
              <span class="hidden md:inline">
                {{ opt.label }}
              </span>
              <span class="inline md:hidden">
                {{ opt.labelShort }}
              </span>
            </label>
          </div>
        </div>
        <div class="cell-block">
          <div class="cell-title">
            {{ la.t("models.dwdy.config.field.isWeekShown") }}
          </div>
          <div
            v-if="appState.hk.value.isMarkShown(hkScope)"
            class="cell-sub-title"
          >
            <span class="hotkey-mark">4</span>
          </div>
          <div class="h-full p-5 flex justify-center items-center">
            <label
              class="swap"
              :class="{
                'border-base-200 border-4 px-2':
                  pn.isCurrent(`is-week-shown-toggle`),
                'swap-active': updatedDiaryAttrs.isWeekShown,
              }"
              @click="onWeekShownToggled"
            >
              <div class="swap-on text-success flex items-center">
                <SvgIcon
                  class="mr-2"
                  icon-set="mdi"
                  :path="mdiToggleSwitch"
                  :size="48"
                ></SvgIcon>
                {{ la.t("app.action.enable") }}
              </div>
              <div class="swap-off text-base-300 flex items-center">
                <SvgIcon
                  class="mr-2"
                  icon-set="mdi"
                  :path="mdiToggleSwitchOffOutline"
                  :size="48"
                ></SvgIcon>
                {{ la.t("app.action.disable") }}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="mb-2"></div>
  </div>
</template>
