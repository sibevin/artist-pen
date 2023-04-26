<script setup lang="ts">
import { PropType } from "vue";
import { mdiText } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { SearchQuery } from "~/dwdy/types/search";
import { layoutComponent } from "~/dwdy/layout/component";
import { featureComponent } from "~/dwdy/feature/component";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  query: {
    type: Object as PropType<SearchQuery>,
    required: true,
  },
});

const dwdyState = useDwdyState();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <div
      v-if="props.query.keywords.length > 0"
      class="max-w-full h-fit btn btn-primary text-primary bg-base-100 hover:text-primary hover:bg-base-100 rounded-xl cursor-default flex justify-start items-center flex-nowrap py-2 pr-4"
    >
      <SvgIcon
        class="flex-none mr-2"
        icon-set="mdi"
        :path="mdiText"
        :size="24"
      ></SvgIcon>
      <div class="select-text cursor-text text-left">
        {{ props.query.keywords.join(" ") }}
      </div>
    </div>
    <component
      :is="
        layoutComponent(dwdyState.diary.value.doc.layout, 'searchHistoryEntry')
      "
      class="max-w-full"
      :query="props.query"
    ></component>
    <template
      v-for="feature in dwdyState.diary.value.enabledFeatures"
      :key="feature"
    >
      <component
        :is="featureComponent(feature, 'searchHistoryEntry')"
        class="max-w-full"
        :query="props.query"
      ></component>
    </template>
  </div>
</template>
