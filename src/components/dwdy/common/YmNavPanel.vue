<script setup lang="ts">
import { ref, watch } from "vue";
import { mdiChevronDoubleRight, mdiChevronDoubleLeft } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import {
  DiaryEntryMovementParams,
  DiaryPageActionParams,
} from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  currentSelectedBtn: {
    type: String,
    default: undefined,
  },
  enableSelector: {
    type: Boolean,
    default: false,
  },
  enableNav: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: "moveToEntry", params: DiaryEntryMovementParams): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const dwdyState = useDwdyState();
const navInfo = ref(await dwdyState.entry.value.navInfo);

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
  }
);

function onDateSelectorOpen(): void {
  if (props.enableSelector) {
    emit("triggerAction", { action: "select-date" });
  }
}

function onPrevMonthClicked(): void {
  emit("moveToEntry", { direction: "prev", unit: "month" });
}

function onNextMonthClicked(): void {
  emit("moveToEntry", { direction: "next", unit: "month" });
}
</script>
<template>
  <div class="flex items-center">
    <button
      v-if="props.enableNav"
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2"
      :class="props.currentSelectedBtn === 'prev-day-btn' ? 'bg-base-200' : ''"
      @click="onPrevMonthClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronDoubleLeft" :size="20"></SvgIcon>
    </button>
    <button
      class="rounded-full flex items-end"
      :class="props.enableSelector ? 'btn btn-ghost pb-1' : 'cursor-default'"
      @click="onDateSelectorOpen"
    >
      <div class="flex items-center text-lg pr-1 pb-1 text-primary">
        {{ currentDate.getFullYear() }}
      </div>
      <div class="flex items-center text-2xl p-1 font-bold text-primary">
        {{ currentDate.getMonth() + 1 }}
      </div>
    </button>
    <button
      v-if="props.enableNav"
      class="btn btn-circle btn-sm btn-ghost rounded-full"
      :class="props.currentSelectedBtn === 'next-day-btn' ? 'bg-base-200' : ''"
      @click="onNextMonthClicked"
    >
      <SvgIcon
        icon-set="mdi"
        :path="mdiChevronDoubleRight"
        :size="20"
      ></SvgIcon>
    </button>
  </div>
</template>
