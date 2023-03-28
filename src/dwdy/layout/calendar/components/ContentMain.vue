<script setup lang="ts">
import { computed, nextTick } from "vue";
import { mdiPlus } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { featureIcon, featureText } from "~/dwdy/feature/map";
import { DiaryLayout } from "~/dwdy/layout/def";
import { featureComponent } from "~/dwdy/feature/component";
import {
  DiaryContentFeatureIndex,
  DiaryEntryMovementParams,
  DiaryPageActionParams,
} from "~/dwdy/types/core";
import { dtToEntryTs, getNeighborTs } from "~/dwdy/services/dateUtils";
import SvgIcon from "~/components/SvgIcon.vue";
import CalendarPanel from "~/dwdy/layout/calendar/components/CalendarPanel.vue";
import CalendarSwitchBtn from "~/dwdy/layout/calendar/components/CalendarSwitchBtn.vue";
import YmNavPanel from "~/components/dwdy/common/YmNavPanel.vue";
import YmdNavPanel from "~/components/dwdy/common/YmdNavPanel.vue";

const emit = defineEmits<{
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("pages.dwdy.DiaryPage.calendar.contentPanel");
const calendarConfig = computed(() => {
  return dwdyState.diary.value.fetchLayoutConfig(DiaryLayout.Calendar);
});

const currentDt = computed<Date>(() => {
  return dwdyState.entry.value.tsDate || new Date();
});

const isDesktopTemplateLeftOnly = computed<boolean>(() => {
  return dwdyState.diary.value.doc.template.desktop.right.length <= 0;
});

function onMoveDateTriggered(givenDt: Date): void {
  const timestamp = dtToEntryTs(givenDt);
  moveToEntry({ direction: "current", timestamp });
}

function onContentEditorOpen(cfi: DiaryContentFeatureIndex): void {
  nextTick(() => {
    emit("triggerAction", {
      action: "open-feature-editor",
      cfi,
      timestamp: dtToEntryTs(currentDt.value),
    });
  });
}

function onOpenFullViewer(cfi: DiaryContentFeatureIndex): void {
  nextTick(() => {
    emit("triggerAction", { action: "open-full-viewer", cfi });
  });
}

async function updateStateEntryByTs(timestamp: number): Promise<void> {
  let entry = await dwdyState.diary.value.fetchEntry({ timestamp });
  if (!entry) {
    entry = dwdyState.diary.value.buildEntry({ timestamp });
  }
  await dwdyState.updateEntry(entry.doc);
}

function triggerAction(params: DiaryPageActionParams): void {
  nextTick(() => {
    emit("triggerAction", params);
  });
}

async function moveToEntry(params: DiaryEntryMovementParams): Promise<void> {
  let targetDIndex;
  if (params.direction === "next" || params.direction === "prev") {
    if (params.unit === "page") {
      if (params.direction === "next") {
        targetDIndex = dwdyState.entry.value.doc.nextDIndex;
      } else {
        targetDIndex = dwdyState.entry.value.doc.prevDIndex;
      }
    } else if (params.unit === "day" || params.unit === "month") {
      if (dwdyState.entry.value.doc.timestamp) {
        const timestamp = getNeighborTs(dwdyState.entry.value.doc.timestamp, {
          direction: params.direction,
          unit: params.unit,
        });
        updateStateEntryByTs(timestamp);
      }
    }
  } else if (params.direction === "current" && params.dIndex) {
    targetDIndex = params.dIndex;
  } else if (params.direction === "current" && params.timestamp) {
    updateStateEntryByTs(params.timestamp);
  }
  if (targetDIndex) {
    await dwdyState.fetchEntry(targetDIndex);
  }
}

defineExpose({ moveToEntry });
</script>
<template>
  <div class="absolute inset-0">
    <div class="h-full flex md:hidden flex-col">
      <div class="pt-2 flex justify-center">
        <div class="flex flex-col items-stretch">
          <div
            v-if="calendarConfig.isCalendarShown"
            class="w-full flex justify-between items-center"
          >
            <YmNavPanel
              :current-date="currentDt"
              :enable-selector="true"
              :enable-nav="true"
              @trigger-action="triggerAction"
              @move-to-entry="moveToEntry"
            ></YmNavPanel>
            <CalendarSwitchBtn></CalendarSwitchBtn>
          </div>
          <div v-else class="flex justify-between">
            <div class="flex justify-center">
              <YmdNavPanel
                :current-date="currentDt"
                :enable-selector="true"
                :enable-nav="true"
                @trigger-action="triggerAction"
                @move-to-entry="moveToEntry"
              ></YmdNavPanel>
            </div>
            <CalendarSwitchBtn class="mr-3"></CalendarSwitchBtn>
          </div>
          <Transition name="calendar-panel">
            <CalendarPanel
              v-if="calendarConfig.isCalendarShown"
              class="pt-2"
              @move-nav-date="onMoveDateTriggered"
            ></CalendarPanel>
          </Transition>
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
              class="p-2 pt-4 pb-0"
              :enable-click="true"
              @open-full-viewer="onOpenFullViewer"
            ></component>
          </div>
        </div>
        <div v-else class="px-2 pb-2">
          <button
            v-for="feature in dwdyState.diary.value.doc.template.mobile"
            :key="feature"
            class="w-full p-6 flex justify-center items-center border-2 border-dashed rounded border-base-200 mb-2"
            @click="onContentEditorOpen({ feature })"
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
          <div class="flex flex-col items-center">
            <div
              v-if="calendarConfig.isCalendarShown"
              class="w-full flex justify-center items-center"
            >
              <YmNavPanel
                :current-date="currentDt"
                :enable-selector="true"
                :enable-nav="true"
                @trigger-action="triggerAction"
                @move-to-entry="moveToEntry"
              ></YmNavPanel>
              <CalendarSwitchBtn></CalendarSwitchBtn>
            </div>
            <div v-else class="flex justify-center">
              <div class="flex justify-center">
                <YmdNavPanel
                  :current-date="currentDt"
                  :enable-selector="true"
                  :enable-nav="true"
                  @trigger-action="triggerAction"
                  @move-to-entry="moveToEntry"
                ></YmdNavPanel>
              </div>
              <CalendarSwitchBtn class="mr-3"></CalendarSwitchBtn>
            </div>
            <Transition name="calendar-panel">
              <CalendarPanel
                v-if="calendarConfig.isCalendarShown"
                class="pt-2"
                @move-nav-date="onMoveDateTriggered"
              ></CalendarPanel>
            </Transition>
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
                class="p-2 pt-4 pb-0"
                :enable-click="true"
                @open-full-viewer="onOpenFullViewer"
              ></component>
            </div>
          </div>
          <div v-else>
            <button
              v-for="feature in dwdyState.diary.value.doc.template.desktop.left"
              :key="feature"
              class="w-full p-6 flex justify-center items-center border-2 border-dashed rounded border-base-200 mb-2"
              @click="onContentEditorOpen({ feature })"
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
              class="pt-4 pr-4 pb-0"
              :enable-click="true"
              @open-full-viewer="onOpenFullViewer"
            ></component>
          </div>
        </div>
        <div v-else class="p-4 pt-2 pl-0">
          <button
            v-for="feature in dwdyState.diary.value.doc.template.desktop.right"
            :key="feature"
            class="w-full p-6 flex justify-center items-center border-2 border-dashed rounded border-base-200 mb-2"
            @click="onContentEditorOpen({ feature })"
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

<style scoped>
.calendar-panel-enter-active,
.calendar-panel-leave-active {
  transition: all 0.3s ease;
}
.calendar-panel-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}
.calendar-panel-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
