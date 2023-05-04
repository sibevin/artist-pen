<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import {
  mdiCircle,
  mdiDotsCircle,
  mdiFileEditOutline,
  mdiOverscan,
} from "@mdi/js";
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
import { DiaryContentFeatureIndex } from "~/types/dwdy/core";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/image/components/ContentSlate.vue";

import "@egjs/vue3-flicking/dist/flicking.css";

const MAX_CAROUSEL_DOTS = 5;

const emit = defineEmits<{
  (e: "openFullViewer", params: DiaryContentFeatureIndex): void;
  (e: "openFeatureEditor", params: DiaryContentFeatureIndex): void;
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
  () => dwdyState.entry.value,
  () => {
    const stateDaUids = dwdyState.entry.value
      .fetchContents<DiaryFeature.Image>(DiaryFeature.Image)
      .map((content) => content.daUid)
      .toString();
    const currentDaUids = imagePacks.value.map((pack) => pack.daUid).toString();
    if (stateDaUids != currentDaUids) {
      fetchImages();
    }
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
      if (daDoc && daDoc.data) {
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

function onFullViewerBtnClicked(): void {
  const index =
    featureConfig.value.display === "carousel" ? imageFlickerIndex.value : 0;
  emit("openFullViewer", { feature: DiaryFeature.Image, index });
}

function onEditBtnClicked(): void {
  nextTick(() => {
    const index =
      featureConfig.value.display === "carousel" ? imageFlickerIndex.value : 0;
    emit("openFeatureEditor", { feature: DiaryFeature.Image, index });
  });
}
</script>
<template>
  <div v-if="currentImageCount > 0">
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
              v-if="currentImageCount > MAX_CAROUSEL_DOTS"
              class="flex justify-center items-center"
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
              class="flex justify-center items-center"
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
    </div>
    <div v-else class="mt-4 px-2 w-full">
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
    </div>
  </div>
</template>
