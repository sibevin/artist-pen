<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { mdiCircle, mdiDotsCircle } from "@mdi/js";
import { ChangedEvent } from "@egjs/flicking";
import Flicking from "@egjs/vue3-flicking";
import { useDwdyState } from "~/states/useDwdyState";
import { useWorkerState } from "~/states/useWorkerState";
import { DiaryFeature } from "~/dwdy/feature/def";
import {
  FeatureConfig,
  FEATURE_ICON,
  ImagePack,
} from "~/dwdy/feature/image/def";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/image/components/ContentSlate.vue";

import "@egjs/vue3-flicking/dist/flicking.css";

const MAX_IMAGE_DOTS = 8;

const dwdyState = useDwdyState();
const workerState = useWorkerState();
const featureConfig = computed<FeatureConfig>(() => {
  return dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Image);
});
const imageFlicker = ref();
const imageFlickerIndex = ref(0);
const imagePacks = ref<ImagePack[]>([]);

const currentImageCount = computed<number>(() => {
  return imagePacks.value.length;
});

fetchImages();

watch(
  () => [dwdyState.entry.value],
  () => {
    fetchImages();
  }
);

async function fetchImages(): Promise<void> {
  const contents = dwdyState.entry.value.fetchContents<DiaryFeature.Image>(
    DiaryFeature.Image
  );
  imagePacks.value = [];
  if (contents.length === 0) {
    return;
  }
  if (!dwdyState.entry.value.doc.dUid || !dwdyState.entry.value.doc.dIndex) {
    return;
  }
  imagePacks.value = new Array(contents.length);
  contents.forEach(async (content, index) => {
    if (
      dwdyState.entry.value.doc.dUid &&
      dwdyState.entry.value.doc.dIndex &&
      content.daUid
    ) {
      const daDoc = await workerState.attachment.loadAttachment({
        dUid: dwdyState.entry.value.doc.dUid,
        dIndex: dwdyState.entry.value.doc.dIndex,
        daUid: content.daUid,
      });
      if (daDoc) {
        imagePacks.value[index] = Object.assign(
          {
            dataUrl: daDoc.data,
          },
          content
        );
      }
    }
  });
}

function moveImageFlicker(index: number): void {
  if (imageFlicker.value) {
    imageFlicker.value.moveTo(index);
  }
}
function isCurrentImage(index: number): boolean {
  return imageFlickerIndex.value === index;
}
function onFlickerChanged(event: ChangedEvent): void {
  imageFlickerIndex.value = event.index;
}
</script>
<template>
  <div v-if="currentImageCount > 0" class="w-full h-full overflow-y-auto">
    <div
      v-if="featureConfig.display === 'list'"
      class="w-full flex flex-col items-center mb-16"
    >
      <div
        v-for="(pack, index) in imagePacks"
        :key="index"
        class="hidden md:block mb-2"
        :style="`max-width: ${featureConfig.desktopFullViewerW}%`"
      >
        <div class="mb-2 flex items-center">
          <SvgIcon
            :icon-set="FEATURE_ICON.main.set"
            :path="FEATURE_ICON.main.path"
            :size="20"
          ></SvgIcon>
          <div v-if="currentImageCount > 1" class="ml-2 text-sm font-bold">
            {{ index + 1 }}
          </div>
        </div>
        <ContentSlate
          v-if="pack && pack.dataUrl"
          :image-meta="pack"
          :data-url="pack.dataUrl"
        >
        </ContentSlate>
        <SvgIcon
          v-else
          class="text-base-300 animate-spin-slow m-5"
          icon-set="mdi"
          :path="mdiDotsCircle"
          :size="20"
        ></SvgIcon>
      </div>
      <div
        v-for="(pack, index) in imagePacks"
        :key="index"
        class="mb-2 md:hidden"
      >
        <div class="mb-2 flex items-center">
          <SvgIcon
            :icon-set="FEATURE_ICON.main.set"
            :path="FEATURE_ICON.main.path"
            :size="20"
          ></SvgIcon>
          <div v-if="currentImageCount > 1" class="ml-2 text-sm font-bold">
            {{ index + 1 }}
          </div>
        </div>
        <ContentSlate
          v-if="pack && pack.dataUrl"
          :image-meta="pack"
          :data-url="pack.dataUrl"
        >
        </ContentSlate>
        <SvgIcon
          v-else
          class="text-base-300 animate-spin-slow m-5"
          icon-set="mdi"
          :path="mdiDotsCircle"
          :size="20"
        ></SvgIcon>
      </div>
    </div>
    <div v-else class="absolute inset-0 bottom-16 flex flex-col lg:flex-row">
      <div class="pb-2 pr-2 flex lg:flex-col items-center">
        <SvgIcon
          class="mr-2 lg:mb-2 lg:mr-0"
          :icon-set="FEATURE_ICON.main.set"
          :path="FEATURE_ICON.main.path"
          :size="20"
        ></SvgIcon>
        <div
          v-if="currentImageCount > MAX_IMAGE_DOTS"
          class="flex items-center"
        >
          <button
            class="text-sm flex lg:flex-col items-center"
            @click="
              moveImageFlicker((imageFlickerIndex + 1) % currentImageCount)
            "
          >
            <div class="m-2 lg:m-0 font-bold">
              {{ imageFlickerIndex + 1 }}
            </div>
            <div>⁄</div>
            <div class="m-2 lg:m-0">
              {{ currentImageCount }}
            </div>
          </button>
        </div>
        <div
          v-else-if="currentImageCount > 1"
          class="grow flex lg:flex-col items-center"
        >
          <button
            v-for="index in [...Array(currentImageCount).keys()]"
            :key="index"
            class="p-2"
            @click="moveImageFlicker(index)"
          >
            <SvgIcon
              icon-set="mdi"
              :path="mdiCircle"
              :size="isCurrentImage(index) ? 8 : 5"
            ></SvgIcon>
          </button>
        </div>
      </div>
      <Flicking
        ref="imageFlicker"
        :options="{
          align: 'center',
          circular: true,
        }"
        class="grow max-w-full max-h-full"
        @changed="onFlickerChanged"
      >
        <div
          v-for="(pack, index) in imagePacks"
          :id="'slide_image_' + index"
          :key="index"
          class="panel w-full flex flex-col items-center"
        >
          <ContentSlate
            v-if="pack && pack.dataUrl"
            :image-meta="pack"
            :data-url="pack.dataUrl"
            onmousedown="if (event.preventDefault) event.preventDefault()"
          >
          </ContentSlate>
          <SvgIcon
            v-else
            class="text-base-300 animate-spin-slow m-5"
            icon-set="mdi"
            :path="mdiDotsCircle"
            :size="20"
          ></SvgIcon>
        </div>
      </Flicking>
    </div>
  </div>
</template>
