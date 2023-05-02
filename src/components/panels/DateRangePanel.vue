<script setup lang="ts">
import { computed } from "vue";
import { LocaleActor } from "~/services/locale";
import { dsToDt } from "~/services/dwdy/dateUtils";
import YmdBlock from "~/components/dwdy/common/YmdBlock.vue";

const props = defineProps({
  dateRange: {
    type: String,
    default: "_",
  },
});

const la = new LocaleActor("components.input.DateRangeSelector");

const dateRangeFromDt = computed<Date | undefined>(() => {
  if (!props.dateRange) {
    return undefined;
  }
  const fromDs = props.dateRange.split("_")[0];
  if (fromDs) {
    return dsToDt(fromDs);
  }
  return undefined;
});

const dateRangeToDt = computed<Date | undefined>(() => {
  if (!props.dateRange) {
    return undefined;
  }
  const toDs = props.dateRange.split("_")[1];
  if (toDs) {
    return dsToDt(toDs);
  }
  return undefined;
});
</script>
<template>
  <div class="flex flex-col gap-3">
    <div class="mx-2 flex justify-center items-center gap-4">
      <YmdBlock
        v-if="dateRangeFromDt"
        class="flex-none hidden md:flex"
        :current-date="dateRangeFromDt"
        week-day-format="long"
      ></YmdBlock>
      <YmdBlock
        v-if="dateRangeFromDt"
        class="flex-none md:hidden"
        :current-date="dateRangeFromDt"
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
        v-if="dateRangeToDt"
        class="flex-none hidden md:flex"
        :current-date="dateRangeToDt"
      ></YmdBlock>
      <YmdBlock
        v-if="dateRangeToDt"
        class="flex-none md:hidden"
        :current-date="dateRangeToDt"
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
