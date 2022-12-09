<script setup lang="ts">
import { computed } from "vue";
// import Flicking from "@egjs/vue3-flicking";
import "@egjs/vue3-flicking/dist/flicking.css";
interface Props {
  codes: string[];
  stickerAlign: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "holdStart"): void;
  (e: "holdEnd"): void;
}>();

const hasStickers = computed<boolean>(() => {
  return props.codes && props.codes.length > 0;
});
function onFlickerHoldStarted(): void {
  emit("holdStart");
}
function onFlickerHoldEnded(): void {
  emit("holdEnd");
}
</script>

<template>
  <div v-if="hasStickers" class="w-full">
    <Flicking
      class="w-full"
      :options="{
        align: props.stickerAlign,
        bound: true,
      }"
      @hold-start="onFlickerHoldStarted"
      @hold-end="onFlickerHoldEnded"
    >
      <div
        v-for="stickerCode in props.codes"
        :id="stickerCode"
        :key="stickerCode"
        class="panel"
      >
        <DwdyStickerIcon class="mx-1" :code="stickerCode"></DwdyStickerIcon>
      </div>
    </Flicking>
  </div>
</template>
