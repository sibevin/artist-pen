<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { mdiAlert } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import {
  dtToDs,
  dsToDt,
  getNeighborDs,
  getNeighborDt,
  GetNeighborOption,
  getWeekOfYear,
  getWeekOfYearFirstDt,
  getQuarter,
  getQuarterFirstDt,
  getHalfYear,
  getHalfYearFirstDt,
} from "~/dwdy/services/dateUtils";
import YmdBlock from "~/components/dwdy/common/YmdBlock.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const DATE_RANGE_TYPES = ["none", "1w", "1m", "1q", "1h", "1y"] as const;
type DateRangeType = typeof DATE_RANGE_TYPES[number];

type DateRange = { from: string; to: string };
type DateRangeMapDef = {
  type: DateRangeType;
  recentOpt: GetNeighborOption;
};
type DateRangeMapEntry = {
  mark: string;
  value: string;
  valid: boolean;
  text?: string;
};
type DateRangeMap = {
  type: DateRangeType;
  recentEntry: DateRangeMapEntry;
  subEntries: DateRangeMapEntry[];
};
const props = defineProps({
  currentMark: {
    type: String,
    default: "none",
  },
});

const emit = defineEmits<{
  (e: "select", value: DateRangeMapEntry): void;
}>();

const la = new LocaleActor("components.input.DateRangeSelector");
const BASED_DATE_RANGE_COUNT = 4;
const PREDEFINED_DATE_RANGES: DateRangeMapDef[] = [
  { type: "1w", recentOpt: { direction: "prev", unit: "day", step: 7 } },
  { type: "1m", recentOpt: { direction: "prev", unit: "day", step: 30 } },
  { type: "1q", recentOpt: { direction: "prev", unit: "day", step: 90 } },
  // { type: "1h", recentOpt: { direction: "prev", unit: "day", step: 180 } },
  { type: "1y", recentOpt: { direction: "prev", unit: "month", step: 12 } },
];
const todayDs = dtToDs(new Date());
const todayDt = dsToDt(todayDs);
const customizedDateRange = ref<DateRange>({
  from: "",
  to: todayDs,
});
const isFromEnabled = ref(false);
const isToEnabled = ref(true);
const currentEntry = ref<DateRangeMapEntry | undefined>();
const predefinedDateRanges = buildPredefinedDateRanges();

const currentEntryFromDt = computed<Date | undefined>(() => {
  if (!currentEntry.value) {
    return undefined;
  }
  const fromDs = currentEntry.value.value.split("_")[0];
  if (fromDs) {
    return dsToDt(fromDs);
  }
  return undefined;
});

const currentEntryToDt = computed<Date | undefined>(() => {
  if (!currentEntry.value) {
    return undefined;
  }
  const toDs = currentEntry.value.value.split("_")[1];
  if (toDs) {
    return dsToDt(toDs);
  }
  return undefined;
});

const selectedValue = computed<string>({
  get() {
    if (currentEntry.value) {
      return currentEntry.value.mark;
    } else {
      return "none";
    }
  },
  set(value: string) {
    if (value === "customized") {
      const fromDs = isFromEnabled.value ? customizedDateRange.value.from : "";
      const toDs = isToEnabled.value ? customizedDateRange.value.to : "";
      currentEntry.value = {
        mark: "customized",
        value: `${fromDs}_${toDs}`,
        valid: isValidDateRange.value,
      };
    } else {
      const foundEntry = getEntryByMark(value);
      if (foundEntry) {
        currentEntry.value = foundEntry;
      } else {
        currentEntry.value = undefined;
      }
    }
  },
});

const fromMaxDs = computed<string | undefined>(() => {
  if (selectedValue.value === "customized" && isToEnabled.value) {
    return customizedDateRange.value.to;
  } else {
    return undefined;
  }
});

const toMinDs = computed<string | undefined>(() => {
  if (selectedValue.value === "customized" && isFromEnabled.value) {
    return customizedDateRange.value.from;
  } else {
    return undefined;
  }
});

const isValidDateRange = computed<boolean>(() => {
  if (
    currentEntry.value &&
    currentEntry.value.mark === "customized" &&
    fromMaxDs.value &&
    toMinDs.value
  ) {
    return dsToDt(toMinDs.value) <= dsToDt(fromMaxDs.value);
  } else {
    return true;
  }
});

watch(
  () => [
    customizedDateRange.value.from,
    customizedDateRange.value.to,
    isToEnabled.value,
    isFromEnabled.value,
  ],
  () => {
    if (selectedValue.value === "customized") {
      if (isFromEnabled.value && !customizedDateRange.value.from) {
        customizedDateRange.value.from = "";
      }
      if (isToEnabled.value && !customizedDateRange.value.to) {
        customizedDateRange.value.from = todayDs;
      }
      const fromDs = isFromEnabled.value ? customizedDateRange.value.from : "";
      const toDs = isToEnabled.value ? customizedDateRange.value.to : "";
      currentEntry.value = {
        mark: "customized",
        value: `${fromDs}_${toDs}`,
        valid: isValidDateRange.value,
      };
    }
  }
);

watch(
  () => props.currentMark,
  () => {
    selectEntryByMark(props.currentMark);
  }
);

watch(
  () => currentEntry.value,
  () => {
    triggerSelectEvent();
  }
);

function buildPredefinedDateRanges(): DateRangeMap[] {
  const mapEntries: DateRangeMap[] = [
    {
      type: "none",
      recentEntry: {
        mark: "none",
        value: `_`,
        valid: true,
        text: la.t(`.indefinite`) as string,
      },
      subEntries: [],
    },
  ];
  PREDEFINED_DATE_RANGES.map((dateRangeDef) => {
    if (dateRangeDef.type === "1w") {
      mapEntries.push({
        type: dateRangeDef.type,
        recentEntry: buildRecentDateRangeEntry(dateRangeDef),
        subEntries: [...Array(BASED_DATE_RANGE_COUNT).keys()].map((index) => {
          const currentW = getWeekOfYear(todayDt);
          const subW = currentW - index;
          const baseDt = getNeighborDt(todayDt, {
            direction: "prev",
            unit: "day",
            step: index * 7,
          });
          const wFirstDt = getWeekOfYearFirstDt(baseDt, subW);
          const fromDs = dtToDs(wFirstDt);
          const toDs = getNeighborDs(fromDs, {
            direction: "next",
            unit: "day",
            step: 6,
          });
          return {
            mark: `${wFirstDt.getFullYear()}.W${subW}`,
            value: `${fromDs}_${toDs}`,
            valid: true,
          };
        }),
      });
    }
    if (dateRangeDef.type === "1m") {
      mapEntries.push({
        type: dateRangeDef.type,
        recentEntry: buildRecentDateRangeEntry(dateRangeDef),
        subEntries: [...Array(BASED_DATE_RANGE_COUNT).keys()].map((index) => {
          const toDs = getNeighborDs(todayDs, {
            direction: "prev",
            unit: "month",
            step: index,
            alignment: "end",
          });
          const fromDs = getNeighborDs(todayDs, {
            direction: "prev",
            unit: "month",
            step: index,
            alignment: "begin",
          });
          const fromDt = dsToDt(fromDs);
          return {
            mark: `${fromDt.getFullYear()}.${String(
              fromDt.getMonth() + 1
            ).padStart(2, "0")}`,
            value: `${fromDs}_${toDs}`,
            valid: true,
          };
        }),
      });
    }
    if (dateRangeDef.type === "1q") {
      mapEntries.push({
        type: dateRangeDef.type,
        recentEntry: buildRecentDateRangeEntry(dateRangeDef),
        subEntries: [...Array(BASED_DATE_RANGE_COUNT).keys()].map((index) => {
          let subQ = (getQuarter(todayDt) - index) % 4;
          subQ = subQ <= 0 ? subQ + 4 : subQ;
          const baseDt = getNeighborDt(todayDt, {
            direction: "prev",
            unit: "month",
            step: index * 3,
          });
          const qFirstDt = getQuarterFirstDt(baseDt, subQ);
          const fromDs = dtToDs(qFirstDt);
          const toDs = getNeighborDs(fromDs, {
            direction: "next",
            unit: "month",
            step: 2,
            alignment: "end",
          });
          return {
            mark: `${qFirstDt.getFullYear()}.Q${subQ}`,
            value: `${fromDs}_${toDs}`,
            valid: true,
          };
        }),
      });
    }
    if (dateRangeDef.type === "1h") {
      mapEntries.push({
        type: dateRangeDef.type,
        recentEntry: buildRecentDateRangeEntry(dateRangeDef),
        subEntries: [...Array(BASED_DATE_RANGE_COUNT).keys()].map((index) => {
          let subHy = (getHalfYear(todayDt) - index) % 2;
          subHy = subHy <= 0 ? subHy + 2 : subHy;
          const baseDt = getNeighborDt(todayDt, {
            direction: "prev",
            unit: "month",
            step: index * 6,
          });
          const hyFirstDt = getHalfYearFirstDt(baseDt, subHy);
          const fromDs = dtToDs(hyFirstDt);
          const toDs = getNeighborDs(fromDs, {
            direction: "next",
            unit: "month",
            step: 5,
            alignment: "end",
          });
          return {
            mark: `${hyFirstDt.getFullYear()}.H${subHy}`,
            value: `${fromDs}_${toDs}`,
            valid: true,
          };
        }),
      });
    }
    if (dateRangeDef.type === "1y") {
      mapEntries.push({
        type: dateRangeDef.type,
        recentEntry: buildRecentDateRangeEntry(dateRangeDef),
        subEntries: [...Array(BASED_DATE_RANGE_COUNT).keys()].map((index) => {
          const baseDt = getNeighborDt(todayDt, {
            direction: "prev",
            unit: "month",
            step: index * 12,
          });
          const fromDt = new Date(baseDt.getFullYear(), 0, 1);
          const fromDs = dtToDs(fromDt);
          const toDs = dtToDs(new Date(baseDt.getFullYear(), 11, 31));
          return {
            mark: `${fromDt.getFullYear()}`,
            value: `${fromDs}_${toDs}`,
            valid: true,
          };
        }),
      });
    }
  });
  return mapEntries;
}

function buildRecentDateRangeEntry(
  dateRangeDef: DateRangeMapDef
): DateRangeMapEntry {
  const fromDs = getNeighborDs(
    todayDs,
    Object.assign({}, dateRangeDef.recentOpt)
  );
  return {
    mark: dateRangeDef.type.toUpperCase(),
    value: `${fromDs}_${todayDs}`,
    valid: true,
    text: la.t(`.predefined.${dateRangeDef.type}`) as string,
  };
}

function getEntryByMark(mark: string): DateRangeMapEntry | undefined {
  const entries: DateRangeMapEntry[] = [];
  predefinedDateRanges.forEach((dateRange) => {
    entries.push(dateRange.recentEntry);
    dateRange.subEntries.forEach((subEntry) => {
      entries.push(subEntry);
    });
  });
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].mark === mark) {
      return entries[i];
    }
  }
  return undefined;
}

function selectEntryByMark(mark: string) {
  const foundEntry = getEntryByMark(mark);
  if (foundEntry) {
    currentEntry.value = foundEntry;
  } else {
    currentEntry.value = undefined;
  }
}

function triggerSelectEvent(): void {
  if (currentEntry.value) {
    emit("select", currentEntry.value);
  }
}

onMounted(() => {
  selectEntryByMark(props.currentMark);
});
</script>
<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="dateRange in predefinedDateRanges"
      :key="dateRange.recentEntry.mark"
      class="flex flex-col items-start gap-3"
    >
      <label class="flex-none cursor-pointer flex items-center gap-3">
        <input
          v-model="selectedValue"
          type="radio"
          :value="dateRange.recentEntry.mark"
          class="radio"
        />
        <div
          v-if="dateRange.recentEntry.mark !== 'none'"
          class="px-2 py-1 border-2 border-primary rounded text-sm font-bold font-mono"
        >
          {{ dateRange.recentEntry.mark.toUpperCase() }}
        </div>
        <div>{{ dateRange.recentEntry.text }}</div>
      </label>
      <div
        v-if="dateRange.subEntries.length > 0"
        class="flex items-center flex-wrap"
      >
        <div
          v-for="subEntry in dateRange.subEntries"
          :key="subEntry.mark"
          class="mb-2 form-control"
        >
          <label class="cursor-pointer flex items-center gap-3">
            <input
              v-model="selectedValue"
              type="radio"
              :value="subEntry.mark"
              class="radio"
            />
            <div
              class="px-2 py-1 border-2 border-primary rounded text-sm font-bold font-mono"
            >
              {{ subEntry.mark.toUpperCase() }}
            </div>
            <div>{{ subEntry.text }}</div>
          </label>
        </div>
      </div>
    </div>
    <div class="form-control">
      <label class="cursor-pointer flex items-center gap-3">
        <input
          v-model="selectedValue"
          type="radio"
          value="customized"
          class="radio"
        />
        <span>{{ la.t(".selectDateRange") }}</span>
      </label>
    </div>
    <div class="ml-8">
      <div v-if="selectedValue === 'customized'" class="flex flex-col gap-3">
        <div class="flex justify-start items-center gap-3">
          <label class="cursor-pointer flex items-center gap-3">
            <input v-model="isFromEnabled" type="checkbox" class="checkbox" />
            <div>
              {{ la.t(".from") }}
              <span v-show="!isFromEnabled">{{ la.t(".indefinite") }}</span>
            </div>
          </label>
          <input
            v-if="isFromEnabled"
            v-model="customizedDateRange.from"
            :max="fromMaxDs"
            class="w-60 input input-bordered border-base-200"
            type="date"
          />
          <div class="grow"></div>
        </div>
        <div class="flex justify-start items-center gap-3">
          <label class="cursor-pointer flex items-center gap-3">
            <input v-model="isToEnabled" type="checkbox" class="checkbox" />
            <div>
              {{ la.t(".to") }}
              <span v-if="!isToEnabled">{{ la.t(".indefinite") }}</span>
            </div>
          </label>
          <input
            v-if="isToEnabled"
            v-model="customizedDateRange.to"
            :min="toMinDs"
            class="w-60 input input-bordered border-base-200"
            type="date"
          />
          <div class="grow"></div>
        </div>
        <div
          v-if="!isValidDateRange"
          class="p-2 border border-error rounded text-error flex items-center"
        >
          <SvgIcon
            class="mr-2"
            icon-set="mdi"
            :path="mdiAlert"
            :size="16"
          ></SvgIcon>
          {{ la.t(".invalidDateRange") }}
        </div>
      </div>
    </div>
    <div class="mx-2 flex justify-center items-center gap-4">
      <YmdBlock
        v-if="currentEntryFromDt"
        class="flex-none hidden md:flex"
        :current-date="currentEntryFromDt"
        week-day-format="long"
      ></YmdBlock>
      <YmdBlock
        v-if="currentEntryFromDt"
        class="flex-none md:hidden"
        :current-date="currentEntryFromDt"
        week-day-format="short"
      ></YmdBlock>
      <div
        v-else
        class="border-2 border-t-[1rem] border-base-200 p-5 whitespace-nowrap"
      >
        {{ la.t(".indefinite") }}
      </div>
      <div class="min-w-[2rem] border-2 border-base-200"></div>
      <YmdBlock
        v-if="currentEntryToDt"
        class="flex-none hidden md:flex"
        :current-date="currentEntryToDt"
      ></YmdBlock>
      <YmdBlock
        v-if="currentEntryToDt"
        class="flex-none md:hidden"
        :current-date="currentEntryToDt"
        week-day-format="short"
      ></YmdBlock>
      <div
        v-else
        class="border-2 border-t-[1rem] border-base-200 p-5 whitespace-nowrap"
      >
        {{ la.t(".indefinite") }}
      </div>
    </div>
  </div>
</template>
