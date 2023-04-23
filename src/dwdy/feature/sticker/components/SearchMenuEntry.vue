<script setup lang="ts">
import { computed } from "vue";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureText } from "~/dwdy/feature/map";
import { FEATURE_ICON } from "~/dwdy/feature/sticker/def";
import { DiaryPageActionParams } from "~/dwdy/types/core";
import StickerIcon from "~/dwdy/feature/sticker/components/StickerIcon.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "triggerAction", params: DiaryPageActionParams): void;
}>();

const la = new LocaleActor("dwdy.feature.sticker");
const searchState = useSearchState();

const stickers = computed<string[]>(() => {
  return searchState.query.value.feature["sticker"] || [];
});

function onSearchWithTimeRangeBtnClicked(): void {
  emit("triggerAction", {
    action: "open-search-feature-modal",
    cfi: { feature: DiaryFeature.Sticker },
  });
}
</script>
<template>
  <button
    class="btn btn-primary btn-outline rounded-full flex items-center flex-nowrap pr-1"
    @click="onSearchWithTimeRangeBtnClicked()"
  >
    <SvgIcon
      class="mr-2"
      :icon-set="FEATURE_ICON['main'].set"
      :path="FEATURE_ICON['main'].path"
      :size="24"
    ></SvgIcon>
    <div v-if="stickers.length === 0" class="mr-2">
      {{ featureText(DiaryFeature.Sticker, la) }}
    </div>
    <StickerIcon
      v-for="stickerCode in stickers"
      :key="stickerCode"
      class="mx-1 cursor-pointer"
      :code="stickerCode"
      :size-multiplier="0.6"
    ></StickerIcon>
  </button>
</template>
