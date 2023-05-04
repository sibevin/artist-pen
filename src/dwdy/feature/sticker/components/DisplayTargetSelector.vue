<script setup lang="ts">
import { ref } from "vue";
import { LocaleActor } from "~/services/locale";
import { useDwdyState } from "~/states/useDwdyState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { FeatureConfig } from "~/dwdy/feature/sticker/def";
import SvgIcon from "~/components/SvgIcon.vue";
import { stickerCategories } from "../data";
import { mdiNumeric1CircleOutline } from "@mdi/js";

const dwdyState = useDwdyState();
const featureConfig = ref<FeatureConfig>(
  dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Sticker)
);
const la = new LocaleActor("dwdy.feature.sticker");

async function onConfigUpdated(
  givenConfig: Partial<FeatureConfig>
): Promise<void> {
  dwdyState.diary.value.patchFeatureConfig(DiaryFeature.Sticker, givenConfig);
  await dwdyState.diary.value.save();
}
</script>
<template>
  <div class="cell-block">
    <div class="cell-title">
      {{ la.t(".config.displayIconTarget.name") }}
    </div>
    <div class="p-5">
      <div class="w-full grid grid-cols-3 gap-2">
        <label
          class="col-span-3 p-3 rounded cursor-pointer flex justify-center items-center gap-2"
          :class="{
            'bg-base-200': featureConfig.displayIconTarget === 'first',
          }"
          tabindex="0"
        >
          <input
            v-model="featureConfig.displayIconTarget"
            type="radio"
            class="hidden"
            name="displayIconTarget"
            value="first"
            @change="
              onConfigUpdated({
                displayIconTarget: featureConfig.displayIconTarget,
              })
            "
          />
          <SvgIcon
            icon-set="mdi"
            :path="mdiNumeric1CircleOutline"
            :size="32"
          ></SvgIcon>
          {{ la.t(".category.first") }}
        </label>
        <label
          v-for="opt in stickerCategories"
          :key="opt.code"
          class="p-3 rounded cursor-pointer flex flex-col justify-center items-center gap-2"
          :class="{
            'bg-base-200': featureConfig.displayIconTarget === opt.code,
          }"
          tabindex="0"
        >
          <input
            v-model="featureConfig.displayIconTarget"
            type="radio"
            class="hidden"
            name="displayIconTarget"
            :value="opt.code"
            @change="
              onConfigUpdated({
                displayIconTarget: featureConfig.displayIconTarget,
              })
            "
          />
          <SvgIcon
            v-if="opt.icon"
            :icon-set="opt.icon.set"
            :path="opt.icon.path"
            :size="32"
          ></SvgIcon>
          <div>
            {{ la.t(`.category.${opt.code}`) }}
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
