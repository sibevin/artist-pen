<script setup lang="ts">
import { mdiShuffle, mdiDeleteForever, mdiViewGallery } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import SvgIcon from "~/components/SvgIcon.vue";

const la = new LocaleActor("app");
const props = defineProps({
  contentCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "togglePositionChange"): void;
  (e: "toggleDeletion"): void;
  (e: "toggleFullViewer"): void;
}>();
</script>
<template>
  <div v-if="props.contentCount > 0" class="flex justify-center items-center">
    <button
      v-if="props.contentCount > 1"
      class="btn btn-ghost rounded-full items-center"
      @click="emit('togglePositionChange')"
    >
      <SvgIcon icon-set="mdi" :path="mdiShuffle" :size="24"></SvgIcon>
      <div class="hidden md:block ml-2">
        {{ la.t(".action.changeOrder") }}
      </div>
    </button>
    <button
      class="btn btn-ghost text-error rounded-full items-center"
      @click="emit('toggleDeletion')"
    >
      <SvgIcon icon-set="mdi" :path="mdiDeleteForever" :size="24"></SvgIcon>
      <div class="hidden md:block ml-2">
        {{ la.t(".action.delete") }}
      </div>
    </button>
    <button
      class="btn btn-ghost rounded-full items-center"
      @click="emit('toggleFullViewer')"
    >
      <SvgIcon icon-set="mdi" :path="mdiViewGallery" :size="22"></SvgIcon>
      <div class="hidden md:block ml-2">
        {{ la.t(".action.list") }}
      </div>
    </button>
  </div>
</template>
