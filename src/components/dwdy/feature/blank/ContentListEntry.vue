<script setup lang="ts">
const props = defineProps({
  contentIndex: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <div>[ListEntry] Index: {{ props.contentIndex }}</div>
</template>
