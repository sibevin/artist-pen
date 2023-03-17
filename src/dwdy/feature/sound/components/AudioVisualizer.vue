<script setup lang="ts">
import { computed } from "vue";
const MAX_DATA_VALUE = 256;
const VISUALIZER_H = 120;

const props = defineProps({
  dataSet: {
    type: Uint8Array,
    required: true,
  },
});

const svgContent = computed(() => {
  let path = "";
  if (props.dataSet.length > 0) {
    props.dataSet.forEach((value, index) => {
      const yVal = (value / MAX_DATA_VALUE) * VISUALIZER_H;
      if (index === 0) {
        path = `M0,${yVal}`;
      } else {
        path = `${path} L${index},${yVal}`;
      }
    });
    return `<path d="${path}" stroke="currentColor" fill="transparent" stroke-width="3" stroke-linejoin="round"/>`;
  } else {
    return "";
  }
});

const viewBox = computed<string>(() => {
  return `0 0 ${props.dataSet.length} ${VISUALIZER_H}`;
});
</script>

<template>
  <svg :viewBox="viewBox" preserveAspectRatio="none" v-html="svgContent"></svg>
</template>
