<script setup lang="ts">
import { ref } from "vue";
import {
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
  mdiCalendarMultiselect,
} from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryLayout } from "~/dwdy/layout/def";
import { LayoutConfig } from "~/dwdy/layout/calendar/def";
import SvgIcon from "~/components/SvgIcon.vue";

const dwdyState = useDwdyState();
const calendarConfig = ref<LayoutConfig>(
  dwdyState.diary.value.fetchLayoutConfig(DiaryLayout.Calendar)
);

async function onIsCalendarShownToggled(): Promise<void> {
  dwdyState.diary.value.patchLayoutConfig(DiaryLayout.Calendar, {
    isCalendarShown: !calendarConfig.value.isCalendarShown,
  });
  await dwdyState.diary.value.save();
  calendarConfig.value.isCalendarShown = !calendarConfig.value.isCalendarShown;
}
</script>
<template>
  <label
    class="swap btn btn-ghost rounded-full"
    :class="{
      'swap-active': calendarConfig.isCalendarShown,
    }"
    @click="onIsCalendarShownToggled"
  >
    <div class="swap-on text-base-content flex items-center">
      <SvgIcon
        class="mr-2"
        icon-set="mdi"
        :path="mdiCalendarMultiselect"
        :size="24"
      ></SvgIcon>
      <SvgIcon
        class="text-primary"
        icon-set="mdi"
        :path="mdiToggleSwitch"
        :size="32"
      ></SvgIcon>
    </div>
    <div class="swap-off flex items-center">
      <SvgIcon
        class="mr-2"
        icon-set="mdi"
        :path="mdiCalendarMultiselect"
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
</template>
