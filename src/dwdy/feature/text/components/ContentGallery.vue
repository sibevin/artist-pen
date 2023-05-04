<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { mdiCircle, mdiFileEditOutline, mdiOverscan } from "@mdi/js";
import Flicking from "@egjs/vue3-flicking";
import { ChangedEvent } from "@egjs/flicking";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryContentFeatureIndex } from "~/types/dwdy/core";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureConfig, FEATURE_ICON } from "~/dwdy/feature/text/def";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/text/components/ContentSlate.vue";

const MAX_CAROUSEL_DOTS = 5;

const emit = defineEmits<{
  (e: "openFullViewer", value: DiaryContentFeatureIndex): void;
  (e: "openFeatureEditor", params: DiaryContentFeatureIndex): void;
}>();

const dwdyState = useDwdyState();
const featureConfig = computed<FeatureConfig>(() => {
  return dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Text);
});
const carouselFlicker = ref();
const flickerIndex = ref(0);

const currentTextCount = computed<number>(() => {
  return dwdyState.entry.value.fetchContents<DiaryFeature.Text>(
    DiaryFeature.Text
  ).length;
});

function moveTextFlicker(index: number): void {
  if (carouselFlicker.value) {
    carouselFlicker.value.moveTo(index);
  }
}
function isCurrentImage(index: number): boolean {
  return flickerIndex.value === index;
}

function onFlickerChanged(event: ChangedEvent): void {
  flickerIndex.value = event.index;
}

function onFullViewerBtnClicked(): void {
  const index =
    featureConfig.value.display === "carousel" ? flickerIndex.value : 0;
  emit("openFullViewer", { feature: DiaryFeature.Text, index });
}

function onEditBtnClicked(): void {
  nextTick(() => {
    const index =
      featureConfig.value.display === "carousel" ? flickerIndex.value : 0;
    emit("openFeatureEditor", { feature: DiaryFeature.Text, index });
  });
}
</script>
<template>
  <div v-if="currentTextCount > 0">
    <div class="border border-base-200 rounded-md shadow-md">
      <div class="w-full flex items-center gap-2">
        <SvgIcon
          class="flex-none text-primary ml-3.5"
          :icon-set="FEATURE_ICON.main.set"
          :path="FEATURE_ICON.main.path"
          :size="32"
        ></SvgIcon>
        <div class="flex-1">
          <div v-if="featureConfig.display === 'carousel'">
            <div
              v-if="currentTextCount > MAX_CAROUSEL_DOTS"
              class="flex justify-center items-center"
            >
              <button
                class="text-sm flex items-center"
                @click="moveTextFlicker((flickerIndex + 1) % currentTextCount)"
              >
                <div class="font-bold">
                  {{ flickerIndex + 1 }}
                </div>
                <div class="mx-2">⁄</div>
                <div>
                  {{ currentTextCount }}
                </div>
              </button>
            </div>
            <div
              v-else-if="currentTextCount > 1"
              class="flex justify-center items-center"
            >
              <button
                v-for="index in [...Array(currentTextCount).keys()]"
                :key="index"
                class="p-2"
                @click="moveTextFlicker(index)"
              >
                <SvgIcon
                  icon-set="mdi"
                  :path="mdiCircle"
                  :size="isCurrentImage(index) ? 8 : 5"
                ></SvgIcon>
              </button>
            </div>
          </div>
        </div>
        <div class="my-2 flex gap-2">
          <button
            class="flex-none btn btn-circle btn-ghost"
            @click="onFullViewerBtnClicked"
          >
            <SvgIcon icon-set="mdi" :path="mdiOverscan" :size="24"></SvgIcon>
          </button>
        </div>
        <div class="my-2 mr-2 flex gap-2">
          <button
            class="flex-none btn btn-circle btn-ghost"
            @click="onEditBtnClicked"
          >
            <SvgIcon
              icon-set="mdi"
              :path="mdiFileEditOutline"
              :size="24"
            ></SvgIcon>
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="featureConfig.display === 'list'"
      class="mt-3 mx-2 flex flex-col"
    >
      <div
        v-for="index in [...Array(currentTextCount).keys()]"
        :key="index"
        class="mb-2"
      >
        <div v-if="currentTextCount > 1" class="mb-2 flex items-center">
          <SvgIcon
            :icon-set="FEATURE_ICON.main.set"
            :path="FEATURE_ICON.main.path"
            :size="20"
          ></SvgIcon>
          <div
            v-if="dwdyState.entry.value.contentSize(DiaryFeature.Text) > 1"
            class="ml-2 text-sm font-bold"
          >
            {{ index + 1 }}
          </div>
        </div>
        <ContentSlate :content-index="index" :enable-text-select="true">
        </ContentSlate>
      </div>
    </div>
    <div v-else class="mt-4 px-2 w-full">
      <Flicking
        ref="carouselFlicker"
        :options="{
          align: 'center',
          circular: true,
        }"
        class="max-h-full max-w-full"
        @changed="onFlickerChanged"
      >
        <div
          v-for="index in [...Array(currentTextCount).keys()]"
          :id="'slide_text_' + index"
          :key="index"
          class="panel w-full min-h-12 flex flex-col items-center"
        >
          <ContentSlate
            :content-index="index"
            onmousedown="if (event.preventDefault) event.preventDefault()"
          >
          </ContentSlate>
        </div>
      </Flicking>
    </div>
  </div>
</template>
