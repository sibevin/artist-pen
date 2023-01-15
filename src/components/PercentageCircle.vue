<script setup lang="ts">
import { computed, PropType } from "vue";

type PercentColorEntry = { percent: number; color?: string; cssClass?: string };

const props = defineProps({
  percentColors: {
    type: Array as PropType<PercentColorEntry[]>,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 16,
  },
  width: {
    type: Number,
    default: 4,
  },
  barLinecap: {
    type: String,
    default: "round",
  },
  barGap: {
    type: Number,
    default: 0,
  },
});

const RADIUS = 15.91549430918954;

const svgContent = computed(() => {
  let barStr = "";
  let bgPcEntry: PercentColorEntry = { percent: 100, color: "transparent" };
  let prePercent = 0;
  props.percentColors.forEach((pcEntry) => {
    const color = pcEntry.color || "currentColor";
    if (pcEntry.percent === 100) {
      bgPcEntry = pcEntry;
    } else {
      barStr = `<circle class="${
        pcEntry.cssClass
      }" style="fill:none;stroke:${color};stroke-width:${
        props.width
      };stroke-dasharray:${pcEntry.percent - props.barGap},${
        100 - pcEntry.percent + props.barGap
      };stroke-dashoffset:${25 - prePercent};stroke-linecap:${props.barLinecap}"
       cx="21" cy="21" r="${RADIUS}" />${barStr}
      `;
      prePercent = prePercent + pcEntry.percent;
    }
  });
  const bgStr = `<circle class="${
    bgPcEntry.cssClass
  }" style="fill:none;stroke:${
    bgPcEntry.color || "currentColor"
  };stroke-width:${props.width};stroke-dasharray:${
    100 - prePercent - props.barGap
  },${100 - prePercent + props.barGap};stroke-dashoffset:${
    25 - prePercent
  };stroke-linecap:${props.barLinecap}"
       cx="21" cy="21" r="${RADIUS}" />
      `;
  return `${bgStr}${barStr}`;
});
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 42 42"
    v-html="svgContent"
  ></svg>
</template>
