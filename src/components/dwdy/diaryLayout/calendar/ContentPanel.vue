<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { mdiPlus } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { NavInfo } from "~/models/dwdy/diaryEntry";
import { DiaryFeature } from "~/models/dwdy/feature";
import {
  featureIcon,
  featureText,
  featureComponent,
} from "~/models/dwdy/featureDef";
import CalendarPanel from "~/components/dwdy/diaryLayout/calendar/CalendarPanel.vue";
import CalendarSwitchBtn from "~/components/dwdy/diaryLayout/calendar/CalendarSwitchBtn.vue";
import YmNavPanel from "~/components/dwdy/common/YmNavPanel.vue";
import YmdNavPanel from "~/components/dwdy/common/YmdNavPanel.vue";

const emit = defineEmits<{
  (e: "moveNavPrevDay"): void;
  (e: "moveNavNextDay"): void;
  (e: "moveNavPrevPage"): void;
  (e: "moveNavNextPage"): void;
  (e: "moveNavPrevMonth"): void;
  (e: "moveNavNextMonth"): void;
  (e: "moveNavToday"): void;
  (e: "moveNavDate", dt: Date): void;
  (e: "openDateSelector"): void;
  (e: "openContentEditor", action: string): void;
  (e: "openFullViewer"): void;
  (e: "openSearch", query?: string): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage.calendar.contentPanel");
const navInfo = ref<NavInfo>(await dwdyState.entry.value.navInfo);

const currentDt = computed<Date>(() => {
  return dwdyState.entry.value.dIndexDate || new Date();
});

const isDesktopTemplateLeftOnly = computed<boolean>(() => {
  return dwdyState.diary.value.doc.template.desktop.right.length <= 0;
});

watch(
  () => dwdyState.entry.value,
  async () => {
    navInfo.value = await dwdyState.entry.value.navInfo;
  }
);

function onPrevDayClicked(): void {
  emit("moveNavPrevDay");
}
function onNextDayClicked(): void {
  emit("moveNavNextDay");
}
function onPrevPageClicked(): void {
  emit("moveNavPrevPage");
}
function onNextPageClicked(): void {
  emit("moveNavNextPage");
}
function onTodayClicked(): void {
  emit("moveNavToday");
}
function onPrevMonthClicked(): void {
  emit("moveNavPrevMonth");
}
function onNextMonthClicked(): void {
  emit("moveNavNextMonth");
}
function onMoveDateTriggered(givenDt: Date): void {
  emit("moveNavDate", givenDt);
}
function onDateSelectorOpen(): void {
  emit("openDateSelector");
}
function onContentEditorOpen(feature: DiaryFeature): void {
  dwdyState.editingContent.value.feature = feature;
  nextTick(() => {
    emit("openContentEditor", "create");
  });
}
function onOpenFullViewer(feature: DiaryFeature): void {
  dwdyState.editingContent.value.feature = feature;
  nextTick(() => {
    emit("openFullViewer");
  });
}
function onOpenSearch(feature: DiaryFeature, query?: string): void {
  nextTick(() => {
    emit("openSearch", query);
  });
}
</script>
<template>
  <div class="absolute inset-0">
    <div class="h-full flex md:hidden flex-col">
      <div class="pt-2">
        <div class="flex flex-col items-center">
          <div
            v-if="dwdyState.diary.value.doc.isCalendarShown"
            class="flex flex-col items-center"
          >
            <div class="w-full flex items-center pb-2">
              <YmNavPanel
                class="grow"
                :current-date="currentDt"
                @move-nav-next-month="onNextMonthClicked"
                @move-nav-prev-month="onPrevMonthClicked"
                @open-date-selector="onDateSelectorOpen"
              ></YmNavPanel>
              <CalendarSwitchBtn></CalendarSwitchBtn>
            </div>
            <CalendarPanel @move-nav-date="onMoveDateTriggered"></CalendarPanel>
          </div>
          <div v-else class="flex items-center my-1">
            <YmdNavPanel
              class="grow"
              :current-date="currentDt"
              :enable-selector="true"
              @open-date-selector="onDateSelectorOpen"
            ></YmdNavPanel>
            <CalendarSwitchBtn></CalendarSwitchBtn>
          </div>
        </div>
      </div>
      <div class="mt-2 min-h-0 overflow-y-auto">
        <div v-if="dwdyState.entry.value.hasContents">
          <div
            v-for="feature in dwdyState.diary.value.doc.template.mobile"
            :key="feature"
          >
            <component
              :is="featureComponent(feature, 'gallery')"
              class="p-2 pb-0"
              :enable-click="true"
              @open-full-viewer="onOpenFullViewer(feature)"
            ></component>
          </div>
        </div>
        <div v-else class="px-2 pb-2">
          <button
            v-for="feature in dwdyState.diary.value.doc.template.mobile"
            :key="feature"
            class="w-full p-6 flex justify-center items-center border-2 border-dashed rounded border-base-200 mb-2"
            @click="onContentEditorOpen(feature)"
          >
            <SvgIcon
              class="mr-2 text-base-200"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="54"
            ></SvgIcon>
            <div class="indicator">
              <div class="text-lg flex items-center text-base-300">
                {{ featureText(feature, la) }}
                <SvgIcon
                  class="ml-2"
                  icon-set="mdi"
                  :path="mdiPlus"
                  :size="24"
                ></SvgIcon>
              </div>
            </div>
          </button>
        </div>
        <div class="mb-36"></div>
      </div>
    </div>
    <div class="hidden h-full md:flex flex-row">
      <div
        class="flex flex-col items-stretch"
        :class="
          isDesktopTemplateLeftOnly
            ? 'flex-1 w-fit mx-4'
            : 'flex-none w-[26rem] xl:w-[42rem] ml-4 mr-2'
        "
      >
        <div class="pt-2">
          <div
            v-if="dwdyState.diary.value.doc.isCalendarShown"
            class="flex flex-col items-center"
          >
            <div class="w-full flex justify-center items-center pb-2">
              <YmNavPanel
                :current-date="currentDt"
                @move-nav-next-month="onNextMonthClicked"
                @move-nav-prev-month="onPrevMonthClicked"
                @open-date-selector="onDateSelectorOpen"
              ></YmNavPanel>
              <CalendarSwitchBtn class="mr-6"></CalendarSwitchBtn>
            </div>
            <CalendarPanel @move-nav-date="onMoveDateTriggered"></CalendarPanel>
          </div>
          <div v-else class="flex justify-center items-center">
            <div class="flex justify-center">
              <YmdNavPanel
                :current-date="currentDt"
                :enable-selector="true"
                @open-date-selector="onDateSelectorOpen"
              ></YmdNavPanel>
            </div>
            <CalendarSwitchBtn class="mr-3"></CalendarSwitchBtn>
          </div>
        </div>
        <div class="mt-3 w-full min-h-0 overflow-y-auto">
          <div v-if="dwdyState.entry.value.hasContents">
            <div
              v-for="feature in dwdyState.diary.value.doc.template.desktop.left"
              :key="feature"
            >
              <component
                :is="featureComponent(feature, 'gallery')"
                class="p-2 pb-0"
                :enable-click="true"
                @open-full-viewer="onOpenFullViewer(feature)"
                @open-search="onOpenSearch"
              ></component>
            </div>
          </div>
          <div v-else>
            <button
              v-for="feature in dwdyState.diary.value.doc.template.desktop.left"
              :key="feature"
              class="w-full p-6 flex justify-center items-center border-2 border-dashed rounded border-base-200 mb-2"
              @click="onContentEditorOpen(feature)"
            >
              <SvgIcon
                class="mr-2 text-base-200"
                :icon-set="featureIcon(feature).set"
                :path="featureIcon(feature).path"
                :size="54"
              ></SvgIcon>
              <div class="indicator">
                <div class="text-lg flex items-center text-primary">
                  {{ featureText(feature, la) }}
                  <SvgIcon
                    class="ml-2"
                    icon-set="mdi"
                    :path="mdiPlus"
                    :size="24"
                  ></SvgIcon>
                </div>
              </div>
            </button>
          </div>
          <div class="mb-36 lg:mb-24"></div>
        </div>
      </div>
      <div
        v-if="!isDesktopTemplateLeftOnly"
        class="grow min-h-0 pt-2 overflow-y-auto"
      >
        <div v-if="dwdyState.entry.value.hasContents">
          <div
            v-for="feature in dwdyState.diary.value.doc.template.desktop.right"
            :key="feature"
          >
            <component
              :is="featureComponent(feature, 'gallery')"
              class="pt-2 pr-4 pb-0"
              :enable-click="true"
              @open-full-viewer="onOpenFullViewer(feature)"
            ></component>
          </div>
        </div>
        <div v-else class="p-4 pt-2 pl-0">
          <button
            v-for="feature in dwdyState.diary.value.doc.template.desktop.right"
            :key="feature"
            class="w-full p-6 flex justify-center items-center border-2 border-dashed rounded border-base-200 mb-2"
            @click="onContentEditorOpen(feature)"
          >
            <SvgIcon
              class="mr-2 text-base-200"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="54"
            ></SvgIcon>
            <div class="indicator">
              <div class="text-lg flex items-center text-primary">
                {{ featureText(feature, la) }}
                <SvgIcon
                  class="ml-2"
                  icon-set="mdi"
                  :path="mdiPlus"
                  :size="24"
                ></SvgIcon>
              </div>
            </div>
          </button>
        </div>
        <div class="mb-36 lg:mb-24"></div>
      </div>
    </div>
  </div>
</template>
