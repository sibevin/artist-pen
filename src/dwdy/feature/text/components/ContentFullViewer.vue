<script setup lang="ts">
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import SvgIcon from "~/components/SvgIcon.vue";
import ContentSlate from "~/dwdy/feature/text/components/ContentSlate.vue";

const dwdyState = useDwdyState();
</script>
<template>
  <div class="max-w-full max-h-full absolute inset-2 flex flex-col">
    <div ref="textPanel" class="min-h-0 flex-1 overflow-y-auto">
      <div
        v-for="(text, index) in dwdyState.entry.value.fetchContents(
          DiaryFeature.Text
        )"
        :key="index"
        class="mb-2"
      >
        <div class="mb-2 flex items-center">
          <SvgIcon
            :icon-set="featureIcon(DiaryFeature.Text).set"
            :path="featureIcon(DiaryFeature.Text).path"
            :size="20"
          ></SvgIcon>
          <div
            v-if="dwdyState.entry.value.contentSize(DiaryFeature.Text) > 1"
            class="ml-2 text-sm font-bold"
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
