<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mdiChevronLeft, mdiChevronRight, mdiCircleSmall } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { WeekDay } from "~/services/dwdy/configOption";
import {
  DiaryEntryMovementParams,
  DiaryPageActionParams,
} from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  enableSelector: {
    type: Boolean,
    default: false,
  },
  enableNav: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "moveToEntry", params: DiaryEntryMovementParams): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.core");
const dwdyState = useDwdyState();
const navInfo = ref(await dwdyState.entry.value.navInfo);

const diaryConfig = computed(() => {
  return dwdyState.diary.value.fetchDiaryConfig();
});

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

watch(
  () => [dwdyState.entry.value, props.enableNav],
  async () => {
    if (props.enableNav) {
      navInfo.value = await dwdyState.entry.value.navInfo;
    }
  }
);

function isHighlightedWeekDay(givenDt: Date): boolean {
  return diaryConfig.value.highlightedWeekDays.includes(
    givenDt.getDay() as WeekDay
  );
}

function onDateSelectorOpen(): void {
  if (props.enableSelector) {
    emit("triggerAction", { action: "select-date" });
  }
}

function onPrevDayBtnClicked(): void {
  emit("moveToEntry", { direction: "prev", unit: "day" });
}

function onNextDayBtnClicked(): void {
  emit("moveToEntry", { direction: "next", unit: "day" });
}
</script>
<template>
  <div class="flex justify-center items-center gap-2">
    <button
      v-if="props.enableNav"
      class="btn btn-circle btn-sm btn-ghost rounded-full"
      @click="onPrevDayBtnClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronLeft" :size="20"></SvgIcon>
    </button>
    <button
      class="rounded-full flex items-end"
      :class="props.enableSelector ? 'btn btn-ghost pb-1' : 'cursor-default'"
      :tabindex="props.enableSelector ? 0 : -1"
      @click="onDateSelectorOpen"
    >
      <div class="flex items-center text-lg pl-2 pr-1 pb-1 text-primary">
        {{ currentDate.getFullYear() }}
      </div>
      <div class="flex items-center">
        <div
          v-if="diaryConfig.isWeekShown"
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
    <button
      v-if="props.enableNav"
      class="btn btn-circle btn-sm btn-ghost rounded-full"
      @click="onNextDayBtnClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronRight" :size="20"></SvgIcon>
    </button>
  </div>
</template>
