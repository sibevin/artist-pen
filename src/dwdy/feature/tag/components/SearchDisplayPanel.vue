<script setup lang="ts">
import { PropType } from "vue";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON, TagValue } from "~/dwdy/feature/tag/def";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "./ContentSlate.vue";

const props = defineProps({
  tags: {
    type: Array as PropType<TagValue[]>,
    required: true,
  },
  highlightTags: {
    type: Array as PropType<TagValue[]>,
    default: () => [],
  },
});

const la = new LocaleActor("dwdy.feature.sticker");
</script>
<template>
  <div class="flex justify-start items-center">
    <SvgIcon
      class="flex-none"
      :icon-set="FEATURE_ICON['main'].set"
      :path="FEATURE_ICON['main'].path"
      :size="24"
    ></SvgIcon>
    <div
      v-if="props.tags.length > 0"
      class="ml-2 -mr-2 flex items-center flex-wrap"
    >
      <ContentSlate
        v-for="(tag, index) in tags"
        :key="index"
        :content="tag"
        :is-highlight="props.highlightTags.includes(tag)"
        class="mr-2 my-1"
      ></ContentSlate>
    </div>
    <div v-else class="ml-2">
      {{ featureText(DiaryFeature.Tag, la) }}
    </div>
  </div>
</template>
