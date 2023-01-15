<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { mdiCircle } from "@mdi/js";
import { ChangedEvent } from "@egjs/flicking";
import Flicking from "@egjs/vue3-flicking";
import { mdiRdImage } from "~/services/iconSetPath";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import ContentSlate from "~/components/dwdy/feature/image/ContentSlate.vue";
import "@egjs/vue3-flicking/dist/flicking.css";

const MAX_IMAGE_DOTS = 8;

const dwdyState = useDwdyState();
const imageFlicker = ref();
const imageFlickerIndex = ref(0);

const currentImageCount = computed<number>(() => {
  return dwdyState.entry.value.fetchContents<DiaryFeature.Image>(
    DiaryFeature.Image
  ).length;
});

onMounted(() => {
  setCurrentIndex(dwdyState.editingContent.value.index);
});

function moveImageFlicker(index: number): void {
  if (imageFlicker.value) {
    imageFlicker.value.moveTo(index);
  }
  dwdyState.editingContent.value.index = index;
}
function isCurrentImage(index: number): boolean {
  return imageFlickerIndex.value === index;
}
function onFlickerChanged(event: ChangedEvent): void {
  imageFlickerIndex.value = event.index;
  dwdyState.editingContent.value.index = event.index;
}
function setCurrentIndex(index: number): void {
  if (index > -1) {
    moveImageFlicker(index);
  }
}
defineExpose({ setCurrentIndex });
</script>
<template>
  <div
    v-if="currentImageCount > 0"
    class="absolute inset-0 bottom-20 flex flex-col lg:flex-row"
  >
    <div class="pb-2 pr-2 flex lg:flex-col items-center">
      <SvgIcon
        class="mr-2 md:mb-2 md:mr-0"
        icon-set="mdi"
        :path="mdiRdImage"
        :size="20"
      ></SvgIcon>
      <div v-if="currentImageCount > MAX_IMAGE_DOTS" class="flex items-center">
        <button
          class="text-sm flex lg:flex-col items-center"
          @click="moveImageFlicker((imageFlickerIndex + 1) % currentImageCount)"
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
        v-for="index in [...Array(currentImageCount).keys()]"
        :id="'slide_image_' + index"
        :key="index"
        class="panel w-full flex flex-col items-center"
      >
        <ContentSlate
          :content-index="index"
          onmousedown="if (event.preventDefault) event.preventDefault()"
        >
        </ContentSlate>
      </div>
    </Flicking>
  </div>
</template>
