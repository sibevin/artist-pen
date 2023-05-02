<script setup lang="ts">
import { computed, PropType } from "vue";
import { FEATURE_ICON } from "~/dwdy/feature/tag/def";
import { SearchQuery } from "~/types/dwdy/search";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "./ContentSlate.vue";

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

const tags = computed<string[]>(() => {
  return props.query.feature["tag"] || [];
});
</script>
<template>
  <div
    v-if="tags.length > 0"
    class="h-fit btn btn-primary rounded-xl flex justify-start items-center p-1 pl-2"
    :class="
      props.enableHover
        ? 'btn-outline'
        : 'text-primary bg-base-100 hover:text-primary hover:bg-base-100 cursor-default'
    "
  >
    <SvgIcon
      class="mr-2"
      :icon-set="FEATURE_ICON['main'].set"
      :path="FEATURE_ICON['main'].path"
      :size="24"
    ></SvgIcon>
    <ContentSlate
      v-for="(tag, index) in tags"
      :key="index"
      :content="tag"
      class="mr-2 my-1"
    ></ContentSlate>
  </div>
</template>
