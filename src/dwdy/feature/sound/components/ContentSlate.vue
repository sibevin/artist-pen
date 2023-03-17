<script setup lang="ts">
const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <div>[Slate] Index: {{ props.contentIndex }}</div>
</template>
