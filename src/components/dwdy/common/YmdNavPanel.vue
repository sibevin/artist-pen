<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mdiCircleSmall } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { WeekDay } from "~/models/dwdy/configOption";
import { NavInfo } from "~/models/dwdy/diaryEntry";
const la = new LocaleActor("dwdy");

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  enableSelector: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits<{
  (e: "openDateSelector"): void;
}>();
const dwdyState = useDwdyState();
const isCalendarShown = ref<boolean>(
  dwdyState.diary.value.doc.isCalendarShown || false
);
const navInfo = ref<NavInfo>(await dwdyState.entry.value.navInfo);

const weekOfYear = computed<number>(() => {
  const yFirstDt = new Date(props.currentDate.getFullYear(), 0, 1);
  return Math.ceil(
    ((props.currentDate.getTime() - yFirstDt.getTime()) / 86400000 +
      yFirstDt.getDay() +
      1) /
      7
  );
});

const dtWdayStyle = computed(() => {
  if (isHighlightedWeekDay(props.currentDate)) {
    return "border-b-4 border-base-200/60";
  } else {
    return "";
  }
});

const wDayDisplay = computed(() => {
  return (la.t(".weekDays.long", { returnObjects: true }) as string[])[
    props.currentDate.getDay()
  ];
});

function isHighlightedWeekDay(givenDt: Date): boolean {
  return dwdyState.diary.value.doc.highlightedWeekDays.includes(
    givenDt.getDay() as WeekDay
  );
}

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
    isCalendarShown.value = dwdyState.diary.value.doc.isCalendarShown || false;
  }
);
function onDateSelectorOpen(): void {
  emit("openDateSelector");
}
</script>
<template>
  <button
    v-if="props.enableSelector"
    class="btn btn-ghost rounded-full flex items-end pb-1"
    @click="onDateSelectorOpen"
  >
    <div class="flex items-center text-lg pl-2 pr-1 pb-1 text-primary">
      {{ currentDate.getFullYear() }}
    </div>
    <div class="flex items-center">
      <div
        v-if="dwdyState.diary.value.doc.isWeekShown"
        class="mx-1 w-7 h-7 flex justify-center items-center bg-primary text-base-100 font-bold"
      >
        {{ weekOfYear }}
      </div>
      <div class="flex items-center text-2xl p-1 font-bold text-primary">
        {{ currentDate.getMonth() + 1 }}
        <SvgIcon icon-set="mdi" :path="mdiCircleSmall" :size="24"></SvgIcon>
        {{ currentDate.getDate() }}
        <div class="ml-2 px-1 text-lg font-normal" :class="dtWdayStyle">
          {{ wDayDisplay }}
        </div>
      </div>
    </div>
  </button>
  <div v-else class="rounded-full flex items-end">
    <div class="flex items-center text-lg pl-2 pr-1 pb-1 text-primary">
      {{ currentDate.getFullYear() }}
    </div>
    <div class="flex items-center">
      <div
        v-if="dwdyState.diary.value.doc.isWeekShown"
        class="mx-1 w-7 h-7 flex justify-center items-center bg-primary text-base-100 font-bold"
      >
        {{ weekOfYear }}
      </div>
      <div class="flex items-center text-2xl p-1 font-bold text-primary">
        {{ currentDate.getMonth() + 1 }}
        <SvgIcon icon-set="mdi" :path="mdiCircleSmall" :size="24"></SvgIcon>
        {{ currentDate.getDate() }}
        <div class="ml-2 px-1 text-lg font-normal" :class="dtWdayStyle">
          {{ wDayDisplay }}
        </div>
      </div>
    </div>
  </div>
</template>
