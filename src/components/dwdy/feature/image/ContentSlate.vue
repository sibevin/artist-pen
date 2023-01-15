<script setup lang="ts">
import { ref, watch } from "vue";
import { mdiDotsCircle } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { FeatureMeta } from "~/models/dwdy/feature/image/index";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});

const dwdyState = useDwdyState();
const imageDataUrl = ref<string>();
const imageMeta = ref<FeatureMeta>();

fetchImage();

watch(
  () => [props.contentIndex, dwdyState.entry.value],
  async () => {
    await fetchImage();
  }
);

async function fetchImage(): Promise<void> {
  if (props.contentIndex < 0) {
    imageDataUrl.value = undefined;
    imageMeta.value = undefined;
    return;
  }
  imageMeta.value = dwdyState.entry.value.fetchContent<DiaryFeature.Image>(
    DiaryFeature.Image,
    props.contentIndex
  );
  if (!imageMeta.value) {
    return;
  }
  const da = await dwdyState.entry.value.fetchAttachment(imageMeta.value.daUid);
  if (!da) {
    return;
  }
  imageDataUrl.value = da.doc.data;
}
</script>
<template>
  <div class="relative w-full h-full flex flex-col justify-center items-center">
    <div class="min-h-0 w-full">
      <img
        v-if="imageDataUrl"
        class="max-w-full max-h-full m-auto"
        :src="imageDataUrl"
      />
      <SvgIcon
        v-else
        class="text-base-300 animate-spin-slow m-5"
        icon-set="mdi"
        :path="mdiDotsCircle"
        :size="20"
      ></SvgIcon>
    </div>
    <div
      v-if="imageMeta && imageMeta.comment"
      class="flex-none self-stretch p-3 border text-left"
      :class="dwdyState.config.value.textFontStyle()"
      v-html="imageMeta.comment"
    ></div>
  </div>
</template>
