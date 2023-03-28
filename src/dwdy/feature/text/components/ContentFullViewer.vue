<script setup lang="ts">
import { ref, computed } from "vue";
import Flicking from "@egjs/vue3-flicking";
import { ChangedEvent } from "@egjs/flicking";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryContentFeatureIndex } from "~/dwdy/types/core";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureConfig, FEATURE_ICON } from "~/dwdy/feature/text/def";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/text/components/ContentSlate.vue";
import { mdiCircle } from "@mdi/js";

const MAX_CAROUSEL_DOTS = 8;

const props = defineProps({
  enableClick: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "openFullViewer", value: DiaryContentFeatureIndex): void;
}>();

const dwdyState = useDwdyState();
const featureConfig = computed<FeatureConfig>(() => {
  return dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Text);
});
const carouselFlicker = ref();
const flickerIndex = ref(0);

function onGalleryClicked(): void {
  if (props.enableClick) {
    emit("openFullViewer", { feature: DiaryFeature.Text });
  }
}

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
</script>
<template>
  <div v-if="currentTextCount > 0" class="w-full h-full overflow-y-auto">
    <button
      v-if="featureConfig.display === 'list'"
      class="mb-16"
      :class="props.enableClick ? 'cursor-pointer' : 'cursor-text'"
      @click="onGalleryClicked"
    >
      <div
        v-for="index in [...Array(currentTextCount).keys()]"
        :key="index"
        class="mb-2"
      >
        <div class="mb-2 flex items-center">
          <SvgIcon
            :icon-set="FEATURE_ICON.main.set"
            :path="FEATURE_ICON.main.path"
            :size="20"
          ></SvgIcon>
          <div
            v-if="dwdyState.entry.value.contentSize(DiaryFeature.Text) > 1"
            class="text-sm font-bold"
          >
            {{ index + 1 }}
          </div>
        </div>
        <ContentSlate
          :content-index="index"
          :enable-text-select="!props.enableClick"
        >
        </ContentSlate>
      </div>
    </button>
    <div
      v-else
      class="h-full flex flex-col items-start"
      :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
    >
      <div class="self-stretch flex-none mb-2 flex items-center">
        <SvgIcon
          :icon-set="FEATURE_ICON.main.set"
          :path="FEATURE_ICON.main.path"
          :size="20"
        ></SvgIcon>
        <div
          v-if="currentTextCount > MAX_CAROUSEL_DOTS"
          class="grow flex justify-center items-center"
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
          class="grow flex justify-center items-center"
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
      <button
        class="min-h-0 w-full grow"
        :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
        @click="onGalleryClicked"
      >
        <Flicking
          ref="carouselFlicker"
          :options="{
            align: 'center',
            circular: true,
          }"
          class="h-full w-full"
          @changed="onFlickerChanged"
        >
          <div
            v-for="index in [...Array(currentTextCount).keys()]"
            :id="'slide_text_' + index"
            :key="index"
            class="panel w-full flex flex-col items-center overflow-y-auto"
          >
            <ContentSlate
              :content-index="index"
              class="mb-16"
              onmousedown="if (event.preventDefault) event.preventDefault()"
            >
            </ContentSlate>
          </div>
        </Flicking>
      </button>
    </div>
  </div>
</template>
