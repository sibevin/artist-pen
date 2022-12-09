import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { DwdyConfig } from "~/models/dwdy/config";
import { Diary } from "~/models/dwdy/diary";

interface NavInfo {
  nextDayDt?: Date;
  prevDayDt?: Date;
  nextMonthDt?: Date;
  prevMonthDt?: Date;
  nextPageDt?: Date;
  prevPageDt?: Date;
  isToday: boolean;
}

export const useDwdyState = createGlobalState(() => {
  const config = ref<DwdyConfig>(new DwdyConfig());
  const diary = ref<Diary>(new Diary());
  const navInfo = ref<NavInfo>({ isToday: true });
  return { config, diary, navInfo };
});
