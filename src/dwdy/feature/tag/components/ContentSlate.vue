<script setup lang="ts">
import { mdiPound } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div
    class="w-fit text-primary bg-base-100 p-1 border border-base-content rounded shadow flex justify-start items-center"
  >
    <SvgIcon icon-set="mdi" :path="mdiPound" :size="16"></SvgIcon>
    <div class="mx-1">{{ props.content }}</div>
  </div>
</template>
