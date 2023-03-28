<script setup lang="ts">
import { ref, watch } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { weekDayOpts } from "~/dwdy/config/map";
import { DiaryLayout } from "~/dwdy/layout/def";
import { displayIconOpts } from "~/dwdy/layout/map";
import { LayoutConfig } from "~/dwdy/layout/calendar/def";
import { DiaryConfigAttrs } from "~/models/dwdy/config";
import { mdiToggleSwitch, mdiToggleSwitchOffOutline } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import CalendarPanel from "~/dwdy/layout/calendar/components/CalendarPanel.vue";
import YmdNavPanel from "~/components/dwdy/common/YmdNavPanel.vue";

const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage.settingsModal");
const diaryConfig = ref<DiaryConfigAttrs>(
  dwdyState.diary.value.fetchDiaryConfig()
);
const layoutConfig = ref<LayoutConfig>(
  dwdyState.diary.value.fetchLayoutConfig(DiaryLayout.Calendar)
);

watch(
  () => dwdyState.diary.value,
  () => {
    diaryConfig.value = dwdyState.diary.value.fetchDiaryConfig();
    layoutConfig.value = dwdyState.diary.value.fetchLayoutConfig(
      DiaryLayout.Calendar
    );
  }
);

async function onIsWeekShownUpdated(): Promise<void> {
  diaryConfig.value.isWeekShown = !diaryConfig.value.isWeekShown;

  onDiaryConfigUpdated({
    isWeekShown: diaryConfig.value.isWeekShown,
  });
}

async function onDiaryConfigUpdated(
  givenConfig: Partial<DiaryConfigAttrs>
): Promise<void> {
  dwdyState.diary.value.patchDiaryConfig(givenConfig);
  await dwdyState.diary.value.save();
  dwdyState.config.value.assign(givenConfig);
  await dwdyState.config.value.save();
}

async function onConfigUpdated(
  givenConfig: Partial<LayoutConfig>
): Promise<void> {
  dwdyState.diary.value.patchLayoutConfig(DiaryLayout.Calendar, givenConfig);
  await dwdyState.diary.value.save();
}

async function onHighlightedWeekDaysUpdated(): Promise<void> {
  await onDiaryConfigUpdated({
    highlightedWeekDays: diaryConfig.value.highlightedWeekDays.map((wDay) =>
      Number(wDay)
    ),
  });
}
</script>
<template>
  <div>
    <div class="cell-block mt-5">
      <div class="cell-title">
        {{ la.t("dwdy.layout.calendar.config.calendarDisplay.name") }}
      </div>
      <div class="p-3 flex flex-col items-center">
        <div class="relative p-2 border-2 border-base-200">
          <div class="absolute top-0 left-0 p-2 rounded-br-lg bg-base-200">
            圖例
          </div>
          <div class="max-w-v80 overflow-hidden">
            <YmdNavPanel :current-date="new Date()"></YmdNavPanel>
            <CalendarPanel
              class="pt-2"
              :is-for-config-display="true"
            ></CalendarPanel>
          </div>
        </div>
        <div
          class="self-stretch mt-8 flex flex-col md:flex-row justify-between gap-6 md:gap-3"
        >
          <div class="flex-1 cell-block flex justify-center items-center">
            <div class="cell-title">
              {{ la.t("dwdy.layout.calendar.config.firstWeekDay.name") }}
            </div>
            <div class="p-5 flex justify-center items-center">
              <label
                v-for="opt in weekDayOpts(la)"
                :key="opt.value"
                class="mx-1 md:mx-2 rounded cursor-pointer flex flex-col justify-center items-center"
              >
                <input
                  v-model.number="layoutConfig.firstWeekDay"
                  class="radio mb-2"
                  type="radio"
                  name="firstWeekDay"
                  :value="opt.value"
                  @change="
                    onConfigUpdated({
                      firstWeekDay: layoutConfig.firstWeekDay,
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
          <div class="flex-1 cell-block">
            <div class="cell-title">
              {{ la.t("dwdy.layout.config.displayIcon.name") }}
            </div>
            <div class="p-5 flex">
              <div class="w-full grid grid-cols-3 gap-2">
                <label
                  v-for="opt in displayIconOpts(la)"
                  :key="opt.value"
                  class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
                  :class="{
                    'bg-base-200': layoutConfig.displayIcon === opt.value,
                  }"
                >
                  <input
                    v-model="layoutConfig.displayIcon"
                    type="radio"
                    name="layout"
                    class="hidden"
                    :value="opt.value"
                    @change="
                      onConfigUpdated({ displayIcon: layoutConfig.displayIcon })
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
      </div>
      <div class="p-3 flex flex-col items-center">
        <div
          class="self-stretch flex flex-col md:flex-row justify-between gap-6 md:gap-3"
        >
          <div class="flex-1 cell-block flex justify-center items-center">
            <div class="cell-title">
              {{ la.t("models.dwdy.config.field.highlightedWeekDays") }}
            </div>
            <div class="p-5 flex justify-center items-center">
              <label
                v-for="opt in weekDayOpts(la)"
                :key="opt.value"
                class="mx-1 md:mx-2 rounded cursor-pointer flex flex-col justify-center items-center"
              >
                <input
                  v-model.number="diaryConfig.highlightedWeekDays"
                  class="checkbox mb-2"
                  type="checkbox"
                  name="highlightedWeekDays"
                  :value="opt.value"
                  @change="onHighlightedWeekDaysUpdated"
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
          <div class="flex-1 cell-block">
            <div class="cell-title">
              {{ la.t("dwdy.config.isWeekShown.name") }}
            </div>
            <div class="h-full p-5 flex justify-center items-center">
              <label
                class="swap"
                :class="{
                  'swap-active': diaryConfig.isWeekShown,
                }"
                @click="onIsWeekShownUpdated"
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
    </div>
  </div>
</template>
