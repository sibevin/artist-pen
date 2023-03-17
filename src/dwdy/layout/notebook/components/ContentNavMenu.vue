<script setup lang="ts">
import { ref, watch } from "vue";
import {
  mdiChevronRight,
  mdiChevronLeft,
  mdiPageFirst,
  mdiPageLast,
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
  mdiCalendarToday,
  mdiFormatListBulleted,
} from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";

const props = defineProps({
  currentDIndex: {
    type: String,
    required: true,
  },
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
  (e: "moveNavPrevPage"): void;
  (e: "moveNavNextPage"): void;
}>();

const dwdyState = useDwdyState();
const isNotebookIndexShown = ref<boolean>(
  dwdyState.diary.value.doc.isNotebookIndexShown || false
);
const navInfo = ref(await dwdyState.entry.value.navInfo);

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
    isNotebookIndexShown.value =
      dwdyState.diary.value.doc.isNotebookIndexShown || false;
  }
);

function onPrevPageClicked(): void {
  emit("moveNavPrevPage");
}
function onNextPageClicked(): void {
  emit("moveNavNextPage");
}

async function onIsNotebookIndexShownToggled(): Promise<void> {
  isNotebookIndexShown.value = !isNotebookIndexShown.value;
  dwdyState.diary.value.assign({
    isNotebookIndexShown: isNotebookIndexShown.value,
  });
  await dwdyState.diary.value.save();
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
      <SvgIcon icon-set="mdi" :path="mdiChevronLeft" :size="20"></SvgIcon>
    </button>
    <div
      v-else
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2 text-base-300 hover:bg-base-100 cursor-default"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronLeft" :size="20"></SvgIcon>
    </div>
    <button
      v-if="navInfo.nextEntry"
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2"
      :class="props.currentSelectedBtn === 'next-page-btn' ? 'bg-base-200' : ''"
      @click="onNextPageClicked"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronRight" :size="20"></SvgIcon>
    </button>
    <div
      v-else
      class="btn btn-circle btn-sm btn-ghost rounded-full mr-2 text-base-300 hover:bg-base-100 cursor-default"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronRight" :size="20"></SvgIcon>
    </div>
    <label
      class="swap ml-2 btn btn-ghost rounded-full"
      :class="{
        'border-base-200 border-4 px-2':
          props.currentSelectedBtn === 'calendarToggle',
        'swap-active': isNotebookIndexShown,
      }"
      @click="onIsNotebookIndexShownToggled"
    >
      <div class="swap-on text-base-content flex items-center">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiFormatListBulleted"
          :size="24"
        ></SvgIcon>
        <SvgIcon icon-set="mdi" :path="mdiToggleSwitch" :size="32"></SvgIcon>
      </div>
      <div class="swap-off flex items-center">
        <SvgIcon
          class="mr-2"
          icon-set="mdi"
          :path="mdiFormatListBulleted"
          :size="24"
        ></SvgIcon>
        <SvgIcon
          class="text-base-300"
          icon-set="mdi"
          :path="mdiToggleSwitchOffOutline"
          :size="32"
        ></SvgIcon>
      </div>
    </label>
  </div>
</template>
