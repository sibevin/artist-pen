<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mdiCircleSmall } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { WeekDay } from "~/dwdy/services/configOption";
import SvgIcon from "~/components/SvgIcon.vue";
import { getWeekOfYear } from "~/dwdy/services/dateUtils";

const props = defineProps({
  currentDate: {
    type: Date,
    default: undefined,
  },
  weekDayFormat: {
    type: String,
    default: "long",
  },
});

const la = new LocaleActor("dwdy.core");
const dwdyState = useDwdyState();
const navInfo = ref(await dwdyState.entry.value.navInfo);

const diaryConfig = computed(() => {
  return dwdyState.diary.value.fetchDiaryConfig();
});

const weekOfYear = computed<string>(() => {
  if (!props.currentDate) {
    return "";
  }
  return String(getWeekOfYear(props.currentDate));
});

const dtWdayStyle = computed<string>(() => {
  if (props.currentDate && isHighlightedWeekDay(props.currentDate)) {
    return "border-b-4 border-base-200/60";
  } else {
    return "";
  }
});

const wDayDisplay = computed<string>(() => {
  if (!props.currentDate) {
    return "";
  }
  return (
    la.t(`.weekDays.${props.weekDayFormat}`, {
      returnObjects: true,
    }) as string[]
  )[props.currentDate.getDay()];
});

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
  }
);

function isHighlightedWeekDay(givenDt: Date): boolean {
  return diaryConfig.value.highlightedWeekDays.includes(
    givenDt.getDay() as WeekDay
  );
}
</script>
<template>
  <div v-if="props.currentDate" class="border-2 flex">
    <div class="flex flex-col">
      <div class="border-b-2 bg-base-200 flex justify-center items-center p-1">
        <div class="mx-2">
          {{ props.currentDate.getFullYear() }}
        </div>
        <div
          v-if="diaryConfig.isWeekShown"
          class="px-2 py-1 text-sm text-base-600 border border-base-600 flex justify-center items-center"
        >
          {{ la.t(".week") }} {{ weekOfYear }}
        </div>
      </div>
      <div
        class="px-3 py-2 text-2xl font-bold flex justify-center items-center"
      >
        {{ props.currentDate.getMonth() + 1 }}
        <SvgIcon icon-set="mdi" :path="mdiCircleSmall" :size="24"></SvgIcon>
        {{ props.currentDate.getDate() }}
        <div class="ml-3 text-lg font-normal" :class="dtWdayStyle">
          {{ wDayDisplay }}
        </div>
      </div>
    </div>
  </div>
</template>
