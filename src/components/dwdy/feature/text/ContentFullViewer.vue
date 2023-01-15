<script setup lang="ts">
import { onMounted } from "vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/models/dwdy/feature";
import { featureIcon } from "~/models/dwdy/featureDef";
import ContentSlate from "~/components/dwdy/feature/text/ContentSlate.vue";

const dwdyState = useDwdyState();

onMounted(() => {
  if (dwdyState.entry.value.contentSize(DiaryFeature.Text) > 0) {
    dwdyState.editingContent.value.index = -1;
  }
});
</script>
<template>
  <div class="max-w-full max-h-full absolute inset-2 flex flex-col">
    <div ref="textPanel" class="min-h-0 flex-1 overflow-y-auto">
      <div
        v-for="(text, index) in dwdyState.entry.value.fetchContents(
          DiaryFeature.Text
        )"
        :key="index"
        class="mb-2 flex"
      >
        <div class="pr-2 pb-3 flex flex-col items-center">
          <SvgIcon
            :icon-set="featureIcon(DiaryFeature.Text).set"
            :path="featureIcon(DiaryFeature.Text).path"
            :size="20"
          ></SvgIcon>
          <div
            v-if="dwdyState.entry.value.contentSize(DiaryFeature.Text) > 1"
            class="text-sm font-bold"
          >
            {{ index + 1 }}
          </div>
        </div>
        <ContentSlate :content-index="index" class="cursor-text select-text">
        </ContentSlate>
      </div>
      <div class="mb-20"></div>
    </div>
  </div>
</template>
