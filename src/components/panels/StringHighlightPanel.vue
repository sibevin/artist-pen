<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  target: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    required: true,
  },
  highlightedClass: {
    type: String,
    default: "bg-base-200",
  },
});

const hlStrs = computed<string[]>(() => {
  if (!props.keyword) {
    return [props.target];
  }
  const regex = new RegExp(props.keyword, "g");
  const result: string[] = [];
  let preIndex = 0;
  while (regex.test(props.target)) {
    const lastIndex = regex.lastIndex;
    result.push(props.target.slice(preIndex, lastIndex - props.keyword.length));
    result.push(
      props.target.slice(lastIndex - props.keyword.length, lastIndex)
    );
    preIndex = lastIndex;
  }
  result.push(props.target.slice(preIndex, props.target.length));
  if (result.length > 0) {
    return result;
  } else {
    return [props.target];
  }
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
