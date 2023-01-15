<script setup lang="ts">
import { ref, watch } from "vue";
import { mdiChevronDoubleRight, mdiChevronDoubleLeft } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { NavInfo } from "~/models/dwdy/diaryEntry";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  currentSelectedBtn: {
    type: String,
    default: undefined,
  },
  showNav: {
    type: Boolean,
    default: true,
  },
  showHotkeyHint: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "moveNavPrevMonth"): void;
  (e: "moveNavNextMonth"): void;
  (e: "openDateSelector"): void;
}>();

const dwdyState = useDwdyState();
const navInfo = ref<NavInfo>(await dwdyState.entry.value.navInfo);

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
  }
);

function onPrevMonthClicked(): void {
  emit("moveNavPrevMonth");
}
function onNextMonthClicked(): void {
  emit("moveNavNextMonth");
}
function onDateSelectorOpen(): void {
  emit("openDateSelector");
}
</script>
<template>
  <div class="flex items-center">
    <button
      v-if="props.showNav"
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2"
      :class="props.currentSelectedBtn === 'prev-day-btn' ? 'bg-base-200' : ''"
      @click="onPrevMonthClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronDoubleLeft" :size="20"></SvgIcon>
    </button>
    <button
      class="btn btn-ghost rounded-full flex items-end pb-1"
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
      v-if="props.showNav"
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
