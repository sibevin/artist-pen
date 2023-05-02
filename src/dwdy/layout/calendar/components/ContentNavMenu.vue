<script setup lang="ts">
import { ref, watch } from "vue";
import {
  mdiChevronRight,
  mdiChevronLeft,
  mdiPageFirst,
  mdiPageLast,
  mdiCalendarToday,
  mdiFileEditOutline,
} from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { dtToEntryTs } from "~/services/dwdy/dateUtils";
import {
  DiaryEntryMovementParams,
  DiaryPageActionParams,
} from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  currentSelectedBtn: {
    type: String,
    default: undefined,
  },
  showHotkeyHint: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "moveToEntry", params: DiaryEntryMovementParams): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage.calendar.navMenu");
const navInfo = ref(await dwdyState.entry.value.navInfo);

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
  }
);

function onPrevDayClicked(): void {
  emit("moveToEntry", { direction: "prev", unit: "day" });
}
function onNextDayClicked(): void {
  emit("moveToEntry", { direction: "next", unit: "day" });
}
function onPrevPageClicked(): void {
  emit("moveToEntry", { direction: "prev", unit: "page" });
}
function onNextPageClicked(): void {
  emit("moveToEntry", { direction: "next", unit: "page" });
}
function onTodayClicked(): void {
  emit("moveToEntry", {
    direction: "current",
    timestamp: dtToEntryTs(new Date()),
  });
}
function onEditClicked(): void {
  emit("triggerAction", { action: "select-feature-editor" });
}
</script>
<template>
  <div class="flex justify-center items-center">
    <button
      v-if="navInfo.prevEntry"
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2"
      :class="props.currentSelectedBtn === 'prev-page-btn' ? 'bg-base-200' : ''"
      @click="onPrevPageClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiPageFirst" :size="20"></SvgIcon>
    </button>
    <div
      v-else
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2 text-base-300 hover:bg-base-100 cursor-default"
    >
      <SvgIcon icon-set="mdi" :path="mdiPageFirst" :size="20"></SvgIcon>
    </div>
    <button
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2"
      :class="props.currentSelectedBtn === 'prev-day-btn' ? 'bg-base-200' : ''"
      @click="onPrevDayClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronLeft" :size="20"></SvgIcon>
    </button>
    <div class="indicator mr-2">
      <span
        v-if="props.showHotkeyHint"
        class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
        >b</span
      >
      <button
        class="btn btn-ghost rounded-full flex items-center"
        :class="props.currentSelectedBtn === 'today-btn' ? 'bg-base-200' : ''"
        @click="onTodayClicked"
      >
        <SvgIcon icon-set="mdi" :path="mdiCalendarToday" :size="24"></SvgIcon>
        <div class="ml-2">
          {{ la.t(".today") }}
        </div>
      </button>
    </div>
    <button
      class="btn btn-circle btn-sm btn-ghost rounded-full"
      :class="props.currentSelectedBtn === 'next-day-btn' ? 'bg-base-200' : ''"
      @click="onNextDayClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronRight" :size="20"></SvgIcon>
    </button>
    <button
      v-if="navInfo.nextEntry"
      class="btn btn-circle btn-sm btn-ghost rounded-full"
      :class="props.currentSelectedBtn === 'next-page-btn' ? 'bg-base-200' : ''"
      @click="onNextPageClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiPageLast" :size="20"></SvgIcon>
    </button>
    <div
      v-else
      class="btn btn-circle btn-sm btn-ghost rounded-full text-base-300 hover:bg-base-100 cursor-default"
    >
      <SvgIcon icon-set="mdi" :path="mdiPageLast" :size="20"></SvgIcon>
    </div>
    <div class="indicator mr-2">
      <span
        v-if="props.showHotkeyHint"
        class="indicator-item indicator-bottom mr-2 mb-2 hotkey-mark"
        >n</span
      >
      <button
        class="btn btn-ghost rounded-full flex items-center"
        :class="props.currentSelectedBtn === 'edit-btn' ? 'bg-base-200' : ''"
        @click="onEditClicked"
      >
        <SvgIcon icon-set="mdi" :path="mdiFileEditOutline" :size="24"></SvgIcon>
        <div class="ml-2">
          {{ la.t("app.action.edit") }}
        </div>
      </button>
    </div>
  </div>
</template>
