<script setup lang="ts">
import { computed, PropType } from "vue";
import { mdiClock } from "@mdi/js";
import { SearchQuery } from "~/types/dwdy/search";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  query: {
    type: Object as PropType<SearchQuery>,
    required: true,
  },
  enableHover: {
    type: Boolean,
    default: false,
  },
});

const currentDisplay = computed<string | undefined>(() => {
  const queryDisplay = props.query.timestampRange?.display;
  if (queryDisplay) {
    return queryDisplay;
  }
  return undefined;
});
</script>
<template>
  <div
    v-if="currentDisplay"
    class="h-fit btn btn-primary rounded-xl text-sm font-bold font-mono flex justify-start items-center flex-nowrap py-1 pr-4"
    :class="
      props.enableHover
        ? 'btn-outline'
        : 'text-primary bg-base-100 hover:text-primary hover:bg-base-100 cursor-default'
    "
  >
    <SvgIcon
      class="flex-none mr-2"
      icon-set="mdi"
      :path="mdiClock"
      :size="24"
    ></SvgIcon>
    {{ currentDisplay }}
  </div>
</template>
