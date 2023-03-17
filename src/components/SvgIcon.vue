<script setup lang="ts">
import { computed } from "vue";
const DEFAULT_VIEWBOX = "0 0 16 16";
const ICON_SET_MAP: {
  [key: string]: { viewBox: string; pathOpts?: Record<string, string> };
} = {
  mdi: {
    // Material Design Icon
    viewBox: "0 0 24 24",
  },
  bi: {
    // Bootstrap Icon
    viewBox: "0 0 16 16",
  },
  hi: {
    // Hawcons Icon
    viewBox: "0 0 32 32",
    pathOpts: { "fill-rule": "evenodd" },
  },
  el: {
    // Elusive Icon: https://icon-sets.iconify.design/el/
    viewBox: "0 0 1200 1200",
  },
  uiw: {
    // Uiw Icons: http://icon-sets.iconify.design/uiw/
    viewBox: "0 0 20 20",
  },
  mc: {
    // Mingcute Icons: https://icon-sets.iconify.design/mingcute/
    viewBox: "0 0 24 24",
  },
  noto: {
    // Noto Emoji https://icon-sets.iconify.design/noto/
    viewBox: "0 0 128 128",
  },
  bxs: {
    // BoxIcons (Solid) https://icon-sets.iconify.design/bxs/
    viewBox: "0 0 24 24",
  },
  ion: {
    // IonIcons https://icon-sets.iconify.design/ion/
    viewBox: "0 0 512 512",
  },
  ss: {
    // Svg Spinners https://icon-sets.iconify.design/svg-spinners/
    viewBox: "0 0 24 24",
  },
};

const props = defineProps({
  iconSet: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 16,
  },
  rotate: {
    type: Number,
    default: 0,
  },
  flip: {
    type: String,
    validator(value: string) {
      return ["h", "v", "hv", "none"].includes(value);
    },
    default: "none",
  },
  viewBox: {
    type: String,
    default: null,
  },
  raw: {
    type: String,
    default: null,
  },
});

const svgContent = computed(() => {
  if (props.raw) {
    return props.raw;
  }
  let pathOptStr = "";
  const pathOpts = ICON_SET_MAP[props.iconSet].pathOpts;
  if (pathOpts) {
    Object.keys(pathOpts).forEach((key) => {
      pathOptStr += `${key}="${pathOpts[key]} "`;
    });
  }
  return `<path d="${props.path}" fill="currentColor" ${pathOptStr} />`;
});

const viewBox = computed(() => {
  return (
    props.viewBox || ICON_SET_MAP[props.iconSet].viewBox || DEFAULT_VIEWBOX
  );
});

const svgStyle = computed(() => {
  return {
    "--sx": ["h", "hv"].includes(props.flip) ? "-1" : "1",
    "--sy": ["v", "hv"].includes(props.flip) ? "-1" : "1",
    "--r": isNaN(props.rotate) ? props.rotate : props.rotate + "deg",
  };
});
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    :viewBox="viewBox"
    :style="svgStyle"
    v-html="svgContent"
  ></svg>
</template>

<style scoped>
svg {
  transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
}
</style>
