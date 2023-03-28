<script setup lang="ts">
import { PropType } from "vue";
import { useImage } from "@vueuse/core";
import { mdiDotsCircle } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { FeatureMeta } from "~/dwdy/feature/image/def";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  imageMeta: {
    type: Object as PropType<FeatureMeta>,
    required: true,
  },
  dataUrl: {
    type: String,
    required: true,
  },
});

const dwdyState = useDwdyState();
const { isLoading } = useImage({ src: props.dataUrl });
</script>
<template>
  <div class="relative w-full h-full flex flex-col justify-center items-center">
    <div class="min-h-0 w-full">
      <SvgIcon
        v-if="isLoading"
        class="text-base-300 animate-spin-slow m-5"
        icon-set="mdi"
        :path="mdiDotsCircle"
        :size="20"
      ></SvgIcon>
      <img v-else class="max-w-full max-h-full m-auto" :src="props.dataUrl" />
    </div>
    <div
      v-if="props.imageMeta && props.imageMeta.comment"
      class="flex-none my-3 px-3 border-l-4 border-base-200 text-left"
      :class="dwdyState.config.value.textFontStyle()"
      v-html="props.imageMeta.comment"
    ></div>
  </div>
</template>
