<script setup lang="ts">
import {
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
  mdiCalendarMultiselect,
} from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";

const dwdyState = useDwdyState();

async function onIsCalendarShownToggled(): Promise<void> {
  dwdyState.diary.value.assign({
    isCalendarShown: !dwdyState.diary.value.doc.isCalendarShown,
  });
  await dwdyState.diary.value.save();
}
</script>
<template>
  <label
    class="swap ml-2 btn btn-ghost rounded-full"
    :class="{
      'swap-active': dwdyState.diary.value.doc.isCalendarShown,
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
      <SvgIcon icon-set="mdi" :path="mdiToggleSwitch" :size="32"></SvgIcon>
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
