<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Sortable from "sortablejs";
import { mdiCalendar, mdiTimeline, mdiCursorMove } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryTemplate } from "~/models/dwdy/diary";
import { DiaryLayout } from "~/dwdy/layout/def";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon, featureText } from "~/dwdy/feature/map";
import { featureComponent } from "~/dwdy/feature/component";
import SvgIcon from "~/components/SvgIcon.vue";

const la = new LocaleActor("pages.dwdy.DiaryPage.settingsModal");
const dwdyState = useDwdyState();
const mobileFeatureList = ref();
const mobileRemovedList = ref();
const desktopLeftFeatureList = ref();
const desktopRightFeatureList = ref();
const desktopRemovedList = ref();

const diaryTemplate = ref<DiaryTemplate>(
  Object.assign({}, dwdyState.diary.value.doc.template)
);

onMounted(() => {
  Sortable.create(mobileFeatureList.value, {
    group: { name: "mobile" },
    animation: 200,
    store: {
      get: function () {
        return diaryTemplate.value.mobile;
      },
      set: function (sortable) {
        const removedFeatures = diaryTemplate.value.mobile.filter(
          (feature) => !(sortable.toArray() as DiaryFeature[]).includes(feature)
        );
        if (removedFeatures.length > 0) {
          diaryTemplate.value.desktop.left =
            diaryTemplate.value.desktop.left.filter(
              (feature) => !removedFeatures.includes(feature)
            );
          diaryTemplate.value.desktop.right =
            diaryTemplate.value.desktop.right.filter(
              (feature) => !removedFeatures.includes(feature)
            );
        }
        diaryTemplate.value.mobile = sortable.toArray() as DiaryFeature[];
        dwdyState.diary.value.assignTemplate(diaryTemplate.value);
        console.log("diary", dwdyState.diary.value.doc.template);
        dwdyState.diary.value.save();
      },
    },
    handle: ".handle",
  });
  Sortable.create(mobileRemovedList.value, {
    group: { name: "mobile" },
    animation: 200,
    handle: ".handle",
  });
  Sortable.create(desktopLeftFeatureList.value, {
    group: { name: "desktop" },
    animation: 200,
    store: {
      get: function () {
        return diaryTemplate.value.desktop.left;
      },
      set: function (sortable) {
        const removedFeatures = diaryTemplate.value.desktop.left.filter(
          (feature) => !(sortable.toArray() as DiaryFeature[]).includes(feature)
        );
        if (removedFeatures.length > 0) {
          diaryTemplate.value.mobile = diaryTemplate.value.mobile.filter(
            (feature) => !removedFeatures.includes(feature)
          );
        }
        diaryTemplate.value.desktop.left = sortable.toArray() as DiaryFeature[];
        dwdyState.diary.value.assignTemplate(diaryTemplate.value);
        dwdyState.diary.value.save();
      },
    },
    handle: ".handle",
  });
  Sortable.create(desktopRightFeatureList.value, {
    group: { name: "desktop" },
    animation: 200,
    store: {
      get: function () {
        return diaryTemplate.value.desktop.right;
      },
      set: function (sortable) {
        const removedFeatures = diaryTemplate.value.desktop.right.filter(
          (feature) => !(sortable.toArray() as DiaryFeature[]).includes(feature)
        );
        if (removedFeatures.length > 0) {
          diaryTemplate.value.mobile = diaryTemplate.value.mobile.filter(
            (feature) => !removedFeatures.includes(feature)
          );
        }
        diaryTemplate.value.desktop.right =
          sortable.toArray() as DiaryFeature[];
        dwdyState.diary.value.assignTemplate(diaryTemplate.value);
        dwdyState.diary.value.save();
      },
    },
    handle: ".handle",
  });
  Sortable.create(desktopRemovedList.value, {
    group: { name: "desktop" },
    animation: 200,
    handle: ".handle",
  });
});
</script>

<template>
  <div>
    <div class="cell-block mt-6 mb-2">
      <div class="cell-title">
        {{ la.t(".featurePanel.enabledFeatures") }}
      </div>
      <div class="m-3 mb-0 input-hint-block">
        {{ la.t(".featurePanel.hint") }}
      </div>
      <div
        ref="mobileFeatureList"
        class="droparea flex md:hidden min-h-8 m-3 mb-6 p-1 border border-base-200 flex-col justify-between"
      >
        <div
          v-for="feature in diaryTemplate.mobile"
          :key="feature"
          :data-id="feature"
          class="handle flex items-center m-1 p-3 bg-base-100 border border-base-200 rounded"
        >
          <SvgIcon
            class="mr-2 text-primary"
            :icon-set="featureIcon(feature).set"
            :path="featureIcon(feature).path"
            :size="24"
          ></SvgIcon>
          <div class="grow mr-4 text-primary">
            {{ featureText(feature, la) }}
          </div>
          <SvgIcon icon-set="mdi" :path="mdiCursorMove" :size="20"></SvgIcon>
        </div>
      </div>
      <div class="hidden md:flex p-3 justify-between gap-2">
        <div class="flex-1 flex flex-col justify-stretch">
          <div
            v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Calendar"
            class="w-full mb-2 flex justify-center items-center p-8 border border-base-200 border-dashed"
          >
            <SvgIcon
              class="mr-2 text-primary"
              icon-set="mdi"
              :path="mdiCalendar"
              :size="24"
            ></SvgIcon>
            <div class="text-primary">
              {{ la.t(".featurePanel.calendar") }}
            </div>
          </div>
          <div
            v-if="dwdyState.diary.value.doc.layout === DiaryLayout.Timeline"
            class="w-full mb-2 flex items-center p-3 border border-base-200 border-dashed"
          >
            <SvgIcon
              class="mr-2 text-primary"
              icon-set="mdi"
              :path="mdiTimeline"
              :size="24"
            ></SvgIcon>
            <div class="text-primary">
              {{ la.t(".featurePanel.date") }}
            </div>
          </div>
          <div
            ref="desktopLeftFeatureList"
            class="droparea grow flex flex-col justify-stretch min-h-8 p-1 border border-base-200"
          >
            <div
              v-for="feature in diaryTemplate.desktop.left"
              :key="feature"
              :data-id="feature"
              class="handle flex items-center m-1 p-3 bg-base-100 border border-base-200 rounded"
            >
              <SvgIcon
                class="mr-2 text-primary"
                :icon-set="featureIcon(feature).set"
                :path="featureIcon(feature).path"
                :size="24"
              ></SvgIcon>
              <div class="grow mr-4 text-primary">
                {{ featureText(feature, la) }}
              </div>
              <SvgIcon
                icon-set="mdi"
                :path="mdiCursorMove"
                :size="20"
              ></SvgIcon>
            </div>
          </div>
        </div>
        <div
          ref="desktopRightFeatureList"
          class="droparea flex-1 flex flex-col justify-stretch min-h-8 p-1 border border-base-200"
        >
          <div
            v-for="feature in diaryTemplate.desktop.right"
            :key="feature"
            :data-id="feature"
            class="handle flex items-center m-1 p-3 bg-base-100 border border-base-200 rounded"
          >
            <SvgIcon
              class="mr-2 text-primary"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="24"
            ></SvgIcon>
            <div class="grow mr-4 text-primary">
              {{ featureText(feature, la) }}
            </div>
            <SvgIcon icon-set="mdi" :path="mdiCursorMove" :size="20"></SvgIcon>
          </div>
        </div>
      </div>
      <div class="sep-block m-3">
        <div class="sep-title">
          {{ la.t(".featurePanel.disabledFeatures") }}
        </div>
        <div
          ref="mobileRemovedList"
          class="droparea flex md:hidden min-h-8 mt-3 mb-2 p-1 border border-base-200 flex-col justify-stretch"
        >
          <div
            v-for="feature in dwdyState.diary.value.fetchTemplateDisabledFeatures(
              'mobile'
            )"
            :key="feature"
            :data-id="feature"
            class="handle flex items-center m-1 p-3 bg-base-100 border border-base-200 rounded my-1"
          >
            <SvgIcon
              class="mr-2 text-primary"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="24"
            ></SvgIcon>
            <div class="grow mr-4 text-primary">
              {{ featureText(feature, la) }}
            </div>
            <SvgIcon icon-set="mdi" :path="mdiCursorMove" :size="20"></SvgIcon>
          </div>
        </div>
        <div
          ref="desktopRemovedList"
          class="droparea hidden md:flex min-h-8 mt-3 mb-2 p-1 border border-base-200 flex-col justify-stretch"
        >
          <div
            v-for="feature in dwdyState.diary.value.fetchTemplateDisabledFeatures(
              'desktop'
            )"
            :key="feature"
            :data-id="feature"
            class="handle flex items-center min-h-8 m-1 p-3 bg-base-100 border border-base-200 rounded my-1"
          >
            <SvgIcon
              class="mr-2 text-primary"
              :icon-set="featureIcon(feature).set"
              :path="featureIcon(feature).path"
              :size="24"
            ></SvgIcon>
            <div class="grow mr-4 text-primary">
              {{ featureText(feature, la) }}
            </div>
            <SvgIcon icon-set="mdi" :path="mdiCursorMove" :size="20"></SvgIcon>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-4 mb-2">
      <div class="grid grid-cols-4 gap-2">
        <template
          v-for="(feature, index) in dwdyState.diary.value.enabledFeatures"
          :key="index"
        >
          <div v-if="featureComponent(feature, 'configPanel')">
            <div
              class="h-full flex justify-center items-center border rounded-lg"
            >
              <SvgIcon
                class="mr-2"
                :icon-set="featureIcon(feature).set"
                :path="featureIcon(feature).path"
                :size="24"
              ></SvgIcon>
              {{ featureText(feature, la) }}
            </div>
          </div>
          <div
            v-if="featureComponent(feature, 'configPanel')"
            class="col-span-3 border-t-4 pt-6"
          >
            <component
              :is="featureComponent(feature, 'configPanel')"
            ></component>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.handle {
  cursor: move;
}

.droparea {
  background-size: 12px 12px;
  background-image: repeating-linear-gradient(
    45deg,
    hsl(var(--b2, var(--b1)) / 0.6) 0,
    hsl(var(--b2, var(--b1)) / 0.6) 1px,
    transparent 0,
    transparent 50%
  );
}
</style>
