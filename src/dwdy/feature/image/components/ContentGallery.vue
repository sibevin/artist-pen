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
import { DiaryContentFeatureIndex } from "~/dwdy/types/core";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/image/components/ContentSlate.vue";

import "@egjs/vue3-flicking/dist/flicking.css";

const MAX_IMAGE_DOTS = 8;

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
function onGalleryClicked(): void {
  if (props.enableClick) {
    emit("openFullViewer", {
      feature: DiaryFeature.Image,
      index: imageFlickerIndex.value,
    });
  }
}
</script>
<template>
  <div v-if="currentImageCount > 0">
    <button
      v-if="featureConfig.display === 'list'"
      class="pt-2 border-t-4 border-base-200 flex flex-col"
      :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
      @click="onGalleryClicked"
    >
      <div v-for="(pack, index) in imagePacks" :key="index">
        <div class="mb-2 flex items-center">
          <SvgIcon
            :icon-set="FEATURE_ICON.main.set"
            :path="FEATURE_ICON.main.path"
            :size="20"
          ></SvgIcon>
          <div v-if="imagePacks.length > 1" class="ml-2 text-sm font-bold">
            {{ index + 1 }}
          </div>
        </div>
        <div class="mb-2 w-full h-v60">
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
    </button>
    <div
      v-else
      class="flex flex-col items-start"
      :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
    >
      <div
        class="self-stretch flex-1 pt-2 mb-2 border-t-4 border-base-200 flex items-center"
      >
        <SvgIcon
          :icon-set="FEATURE_ICON.main.set"
          :path="FEATURE_ICON.main.path"
          :size="20"
        ></SvgIcon>
        <div
          v-if="currentImageCount > MAX_IMAGE_DOTS"
          class="grow flex justify-center items-center"
        >
          <button
            class="text-sm flex items-center"
            @click="
              moveImageFlicker((imageFlickerIndex + 1) % currentImageCount)
            "
          >
            <div class="font-bold">
              {{ imageFlickerIndex + 1 }}
            </div>
            <div class="mx-2">⁄</div>
            <div>
              {{ currentImageCount }}
            </div>
          </button>
        </div>
        <div
          v-else-if="currentImageCount > 1"
          class="grow flex justify-center items-center"
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
      <button
        class="min-w-0 grow"
        :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
        @click="onGalleryClicked"
      >
        <Flicking
          ref="imageFlicker"
          :options="{
            align: 'center',
            circular: true,
          }"
          class="max-h-full max-w-full"
          @changed="onFlickerChanged"
        >
          <div
            v-for="(pack, index) in imagePacks"
            :id="'slide_image_' + index"
            :key="index"
            class="panel w-full max-h-v60 flex flex-col items-center"
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
      </button>
    </div>
  </div>
</template>
