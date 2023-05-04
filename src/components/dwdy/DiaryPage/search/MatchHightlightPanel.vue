<script setup lang="ts">
import { computed, PropType } from "vue";
import { SearchKeywordMatch } from "~/types/dwdy/search";

const props = defineProps({
  match: {
    type: Object as PropType<SearchKeywordMatch>,
    required: true,
  },
  highlightedClass: {
    type: String,
    default: "bg-base-200",
  },
});

const hlStrs = computed<string[]>(() => {
  let prefix, highlight, suffix;
  if (
    props.match.index === 0 &&
    props.match.match.length === props.match.highlight.length
  ) {
    prefix = "";
    highlight = props.match.highlight;
    suffix = "";
  } else {
    prefix = props.match.highlight.slice(0, props.match.index + 1);
    highlight = props.match.highlight.slice(
      props.match.index + 1,
      props.match.index + props.match.match.length + 1
    );
    suffix = props.match.highlight.slice(
      props.match.index +
        1 +
        props.match.match.length -
        props.match.highlight.length
    );
  }
  return [prefix, highlight, suffix];
});
</script>
<template>
  <div class="flex items-center">
    <div
      v-for="(str, index) in hlStrs"
      :key="index"
      :class="index % 2 === 0 ? '' : props.highlightedClass"
    >
      {{ str }}
    </div>
  </div>
</template>
