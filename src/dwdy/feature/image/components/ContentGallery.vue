<script setup lang="ts">
import { ref, computed } from "vue";
import { mdiCircle } from "@mdi/js";
import { ChangedEvent } from "@egjs/flicking";
import Flicking from "@egjs/vue3-flicking";
import { mdiRdImage } from "~/services/iconSetPath";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
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
const imageFlicker = ref();
const imageFlickerIndex = ref(0);

const currentImageCount = computed<number>(() => {
  return dwdyState.entry.value.fetchContents<DiaryFeature.Image>(
    DiaryFeature.Image
  ).length;
});

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
  <div
    v-if="currentImageCount > 0"
    class="flex flex-col items-start"
    :class="props.enableClick ? 'cursor-pointer' : 'cursor-default'"
  >
    <div class="self-stretch flex-1 mb-2 flex items-center">
      <SvgIcon icon-set="mdi" :path="mdiRdImage" :size="20"></SvgIcon>
      <div
        v-if="currentImageCount > MAX_IMAGE_DOTS"
        class="grow flex justify-center items-center"
      >
        <button
          class="text-sm flex items-center"
          @click="moveImageFlicker((imageFlickerIndex + 1) % currentImageCount)"
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
          v-for="index in [...Array(currentImageCount).keys()]"
          :id="'slide_image_' + index"
          :key="index"
          class="panel w-full max-h-v60 flex flex-col items-center"
        >
          <ContentSlate
            :content-index="index"
            onmousedown="if (event.preventDefault) event.preventDefault()"
          >
          </ContentSlate>
        </div>
      </Flicking>
    </button>
  </div>
</template>
