<script setup lang="ts">
import { ref } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { displayOpts } from "~/dwdy/feature/map";
import { FeatureConfig } from "~/dwdy/feature/image/def";
import SvgIcon from "~/components/SvgIcon.vue";

const dwdyState = useDwdyState();
const featureConfig = ref<FeatureConfig>(
  dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Image)
);
const la = new LocaleActor("dwdy.feature.text");

async function onConfigUpdated(
  givenConfig: Partial<FeatureConfig>
): Promise<void> {
  dwdyState.diary.value.patchFeatureConfig(DiaryFeature.Image, givenConfig);
  await dwdyState.diary.value.save();
}
</script>
<template>
  <div class="cell-block">
    <div class="cell-title">
      {{ la.t(".config.display.name") }}
    </div>
    <div class="p-5 flex">
      <div class="w-full grid grid-cols-2 gap-2">
        <label
          v-for="opt in displayOpts(la)"
          :key="opt.value"
          class="p-3 rounded cursor-pointer flex flex-col justify-center items-center"
          :class="{
            'bg-base-200': featureConfig.display === opt.value,
          }"
        >
          <input
            v-model="featureConfig.display"
            type="radio"
            name="layout"
            class="hidden"
            :value="opt.value"
            @change="onConfigUpdated({ display: featureConfig.display })"
          />
          <SvgIcon
            v-if="opt.icon"
            class="mb-2"
            :icon-set="opt.icon.set"
            :path="opt.icon.path"
            :size="32"
          ></SvgIcon>
          <div>{{ opt.label }}</div>
        </label>
      </div>
    </div>
  </div>
</template>
