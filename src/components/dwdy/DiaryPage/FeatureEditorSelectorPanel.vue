<script setup lang="ts">
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import SvgIcon from "~/components/SvgIcon.vue";

const emit = defineEmits<{
  (e: "select", value: DiaryFeature): void;
}>();

const dwdyState = useDwdyState();
</script>
<template>
  <div class="p-3 flex justify-between gap-3">
    <button
      v-for="(feature, index) in dwdyState.diary.value.enabledFeatures"
      :key="index"
      @click="emit('select', feature)"
    >
      <SvgIcon
        class="text-base-200"
        :icon-set="featureIcon(feature).set"
        :path="featureIcon(feature).path"
        :size="28"
      ></SvgIcon>
    </button>
  </div>
</template>
