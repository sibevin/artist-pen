<script setup lang="ts">
import { ref, computed, watch } from "vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { Icon } from "~/models/app/types";
import { dtToDIndex, isSameDt } from "~/models/dwdy/dateUtils";
import { DIndex } from "~/models/dwdy/diary";
import { WeekDay } from "~/models/dwdy/configOption";

const emit = defineEmits<{
  (e: "moveNavDate", dt: Date): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("dwdy");
const currentDt = ref<Date>(dwdyState.entry.value.dIndexDate || new Date());

watch(
  () => dwdyState.entry.value,
  async () => {
    currentDt.value = dwdyState.entry.value.dIndexDate || new Date();
  }
);

const dIndexIconMap = computed<Record<DIndex, Icon | null>>(() => {
  const iconMap: Record<DIndex, Icon | null> = {};
  dwdyState.bunch.value.dIndexes.forEach((dIndex) => {
    const entry = dwdyState.bunch.value.entryMap[dIndex];
    iconMap[dIndex] = entry.contentIcon;
  });
  return iconMap;
});

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
  let row = [];
  for (let i = -offsetDays; i < endDays; i++) {
    if ((i + offsetDays) % 7 === 0 && row.length === 7) {
      rows.push(row);
      row = [];
    }
    row.push(new Date(currentY, currentM, i));
  }
  if (row.length > 0) {
    rows.push(row);
  }
  return rows;
}

function dtDiaryIcon(givenDt: Date): Icon | null {
  const dIndex = dtToDIndex(givenDt);
  return dIndexIconMap.value[dIndex];
}

const calendar = computed(() => {
  const rows = buildCalendarRows(
    currentDt.value,
    dwdyState.diary.value.doc.firstWeekDay
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

function getRowWeekOfYear(rowIndex: number): number {
  const mFirstDt = new Date(
    currentDt.value.getFullYear(),
    currentDt.value.getMonth(),
    1
  );
  const yFirstDt = new Date(currentDt.value.getFullYear(), 0, 1);
  const mFirstWeek = Math.ceil(
    ((mFirstDt.getTime() - yFirstDt.getTime()) / 86400000 +
      yFirstDt.getDay() +
      1) /
      7
  );
  return mFirstWeek + rowIndex;
}

function isHighlightedWeekDay(givenDt: Date): boolean {
  return dwdyState.diary.value.doc.highlightedWeekDays.includes(
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
  if (isSameDt(currentDt.value, givenDt)) {
    return "bg-content-100 border-primary border-2";
  } else if (isHighlightedWeekDay(givenDt)) {
    return "bg-base-200/60";
  } else {
    return "";
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
  emit("moveNavDate", givenDt);
}
</script>
<template>
  <div
    class="select-none grid xl:gap-1"
    :style="{
      'grid-template-columns': dwdyState.diary.value.doc.isWeekShown
        ? 'auto repeat(7, 1fr)'
        : 'repeat(7, 1fr)',
    }"
  >
    <div
      v-if="dwdyState.diary.value.doc.isWeekShown"
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
        v-if="dwdyState.diary.value.doc.isWeekShown"
        :key="rowIndex"
        class="h-11 w-11 xl:h-20 text-sm text-base-600 border flex items-center justify-center"
      >
        {{ getRowWeekOfYear(rowIndex) }}
      </div>
      <button
        v-for="dt in row"
        :key="dt.getTime()"
        class="h-11 w-11 xl:h-20 xl:w-20 border flex items-start justify-between"
        :class="dtBlockStyle(dt)"
        @click="moveToDate(dt)"
      >
        <div class="text-xs p-0.5 xl:text-sm xl:p-2" :class="dtDateStyle(dt)">
          {{ dt.getDate() }}
        </div>
        <div
          v-for="(icon, index) in [dtDiaryIcon(dt)]"
          :key="index"
          class="self-end"
        >
          <div v-if="icon" class="m-2 hidden xl:block">
            <SvgIcon
              class="self-end"
              :class="dtIconStyle(dt)"
              :icon-set="icon.set"
              :path="icon.path"
              size="22"
            ></SvgIcon>
          </div>
          <div v-if="icon" class="self-end m-1 xl:hidden">
            <SvgIcon
              class="self-end"
              :class="dtIconStyle(dt)"
              :icon-set="icon.set"
              :path="icon.path"
              size="14"
            ></SvgIcon>
          </div>
        </div>
      </button>
    </template>
  </div>
</template>
