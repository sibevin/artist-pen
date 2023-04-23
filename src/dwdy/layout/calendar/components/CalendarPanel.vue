<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import {
  dtToEntryTs,
  getNeighborDt,
  getWeekOfYear,
  isSameDt,
  isWeekOfYearFirstDt,
} from "~/dwdy/services/dateUtils";
import { DIndex } from "~/dwdy/types/core";
import { WeekDay } from "~/dwdy/services/configOption";
import { Diary } from "~/models/dwdy/diary";
import { DiaryLayout } from "~/dwdy/layout/def";
import { LayoutConfig, DisplayIconFormat } from "~/dwdy/layout/calendar/def";
import { buildDisplayIcons } from "~/dwdy/layout/calendar/action";
import DisplayIconPanel from "~/dwdy/layout/calendar/components/DisplayIconPanel.vue";

const props = defineProps({
  isForConfigDisplay: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "moveNavDate", dt: Date): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("dwdy.core");
const currentDt = ref<Date>(dwdyState.entry.value.tsDate || new Date());
// const tsIconMap = ref<Record<DIndex, Icon | null>>({});

const diaryConfig = computed(() => {
  return dwdyState.diary.value.fetchDiaryConfig();
});
const calendarConfig = computed<LayoutConfig>(() => {
  return dwdyState.diary.value.fetchLayoutConfig(DiaryLayout.Calendar);
});
const tsIconMap = computed<Record<DIndex, DisplayIconFormat[]>>(() => {
  const iconMap: Record<DIndex, DisplayIconFormat[]> = {};
  if (dwdyState.bunch.value && dwdyState.bunch.value.tsDIndexMap) {
    for (let [ts, dIndex] of Object.entries(
      dwdyState.bunch.value.tsDIndexMap
    )) {
      const entry = dwdyState.bunch.value.entryMap[dIndex];
      iconMap[ts] = buildDisplayIcons(dwdyState.diary.value as Diary, entry);
    }
  }
  return iconMap;
});

watch(
  () => dwdyState.entry.value,
  async () => {
    currentDt.value = dwdyState.entry.value.tsDate || new Date();
  }
);

function isNeighborRow(baseDate: Date = new Date(), row: Date[]): boolean {
  const prev7dDt = getNeighborDt(baseDate, {
    direction: "prev",
    unit: "day",
    step: 7,
  });
  const next7dDt = getNeighborDt(baseDate, {
    direction: "next",
    unit: "day",
    step: 7,
  });
  for (let i = 0; i < 7; i++) {
    const dt = row[i];
    if (dt >= prev7dDt && dt <= next7dDt) {
      return true;
    }
  }
  return false;
}

function buildCalendarRows(
  baseDate: Date = new Date(),
  firstWeekDay = 0
): Date[][] {
  const currentY = baseDate.getFullYear();
  const currentM = baseDate.getMonth();
  const mFirstDt = new Date(currentY, currentM, 1);
  const offsetDays = ((mFirstDt.getDay() - firstWeekDay + 7) % 7) - 1;
  // NOTE: Don't show last redundant row
  // const mLastDt = new Date(currentY, currentM + 1, 0);
  // const endDays =
  //   Math.ceil((mLastDt.getDate() + offsetDays + 1) / 7.0) * 7 - offsetDays;
  const endDays = -offsetDays + 42;
  const rows = [];
  let addToCalendar = true;
  let row = [];
  for (let i = -offsetDays; i < endDays; i++) {
    if ((i + offsetDays) % 7 === 0 && row.length === 7) {
      if (props.isForConfigDisplay) {
        addToCalendar = isNeighborRow(baseDate, row);
      }
      if (addToCalendar) {
        rows.push(row);
      }
      row = [];
    }
    row.push(new Date(currentY, currentM, i));
  }
  if (row.length > 0) {
    if (props.isForConfigDisplay) {
      addToCalendar = isNeighborRow(baseDate, row);
    }
    if (addToCalendar) {
      rows.push(row);
    }
  }
  return rows;
}

function dtDisplayIcons(givenDt: Date): DisplayIconFormat[] {
  const ts = dtToEntryTs(givenDt);
  return tsIconMap.value[ts] || [];
}

const calendar = computed(() => {
  const rows = buildCalendarRows(
    currentDt.value,
    calendarConfig.value.firstWeekDay
  );
  const weekDayRow = rows[0].map((dt) => {
    return {
      dayLongDisplay: (
        la.t(".weekDays.long", { returnObjects: true }) as string[]
      )[dt.getDay()],
      dayShortDisplay: (
        la.t(".weekDays.short", { returnObjects: true }) as string[]
      )[dt.getDay()],
      dt,
    };
  });
  return { weekDayRow, rows };
});

function getRowWeekOfYear(row: Date[]): string {
  return String(getWeekOfYear(row[0]));
}

function isHighlightedWeekDay(givenDt: Date): boolean {
  return diaryConfig.value.highlightedWeekDays.includes(
    givenDt.getDay() as WeekDay
  );
}

function dtHeaderBlockStyle(givenDt: Date): string {
  if (isHighlightedWeekDay(givenDt)) {
    return "bg-base-200/60";
  } else {
    return "";
  }
}

function dtBlockStyle(givenDt: Date): string {
  let cursorStyle = props.isForConfigDisplay
    ? "cursor-default"
    : "cursor-pointer";
  if (isSameDt(currentDt.value, givenDt)) {
    return `${cursorStyle} bg-content-100 border-primary border-2`;
  } else if (isHighlightedWeekDay(givenDt)) {
    return `${cursorStyle} bg-base-200/60`;
  } else {
    return cursorStyle;
  }
}

function dtDateStyle(givenDt: Date): string {
  if (isSameDt(currentDt.value, givenDt)) {
    return "text-primary-content bg-primary";
  } else if (isSameDt(currentDt.value, givenDt, "month")) {
    return "text-primary";
  } else if (isHighlightedWeekDay(givenDt)) {
    return "text-base-600";
  } else {
    return "text-base-300";
  }
}

function dtIconStyle(givenDt: Date): string {
  if (isSameDt(currentDt.value, givenDt, "month")) {
    return "text-primary";
  } else if (isHighlightedWeekDay(givenDt)) {
    return "text-base-600";
  } else {
    return "text-base-300";
  }
}

function moveToDate(givenDt: Date): void {
  if (props.isForConfigDisplay) {
    return;
  }
  emit("moveNavDate", givenDt);
}
</script>
<template>
  <div
    class="select-none grid xl:gap-1"
    :style="{
      'grid-template-columns': diaryConfig.isWeekShown
        ? 'auto repeat(7, 1fr)'
        : 'repeat(7, 1fr)',
    }"
  >
    <div
      v-if="diaryConfig.isWeekShown"
      class="h-11 w-11 text-base-600 border flex justify-center items-center"
    >
      {{ la.t(".week") }}
    </div>
    <div
      v-for="(weekDayData, index) in calendar.weekDayRow"
      :key="index"
      class="h-11 w-11 xl:w-20 border flex justify-center items-center"
      :class="dtHeaderBlockStyle(weekDayData.dt)"
    >
      <span class="hidden xl:inline">
        {{ weekDayData.dayLongDisplay }}
      </span>
      <span class="xl:hidden">
        {{ weekDayData.dayShortDisplay }}
      </span>
    </div>
    <template v-for="(row, rowIndex) in calendar.rows">
      <div
        v-if="diaryConfig.isWeekShown"
        :key="rowIndex"
        class="h-14 w-11 xl:h-20 text-sm text-base-600 border flex items-center justify-center"
      >
        {{ getRowWeekOfYear(row) }}
      </div>
      <button
        v-for="(dt, colIndex) of row"
        :key="dt.getTime()"
        class="h-14 w-11 xl:h-20 xl:w-20 border flex flex-col items-stretch justify-between"
        :class="dtBlockStyle(dt)"
        @click="moveToDate(dt)"
      >
        <div class="flex justify-between">
          <div
            class="text-xs p-0.5 rounded-br xl:text-sm xl:p-2 xl:rounded-br-lg"
            :class="dtDateStyle(dt)"
          >
            {{ dt.getDate() }}
          </div>
          <div
            v-if="
              diaryConfig.isWeekShown &&
              colIndex !== 0 &&
              isWeekOfYearFirstDt(dt)
            "
            class="text-xs p-0.5 xl:text-sm xl:p-1 xl:m-1 text-base-100 bg-base-300"
          >
            {{ getWeekOfYear(dt) }}
          </div>
        </div>
        <div class="flex justify-end" :class="dtIconStyle(dt)">
          <DisplayIconPanel
            :display-icons="dtDisplayIcons(dt)"
          ></DisplayIconPanel>
        </div>
      </button>
    </template>
  </div>
</template>
