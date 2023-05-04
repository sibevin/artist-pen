<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { mdiNumeric1CircleOutline, mdiChartBubble } from "@mdi/js";
import { useDwdyState } from "~/states/useDwdyState";
import { LocaleActor } from "~/services/locale";
import { DiaryFeature } from "~/dwdy/feature/def";
import { featureIcon } from "~/dwdy/feature/map";
import { FeatureConfig } from "~/dwdy/feature/sticker/def";
import { SelectionOption } from "~/models/app/types";
import ModalSelector from "~/components/ModalSelector.vue";
import SvgIcon from "~/components/SvgIcon.vue";
import { stickerCategories } from "~/dwdy/feature/sticker/data";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dwdyState = useDwdyState();
const la = new LocaleActor("dwdy.feature.sticker");
const featureConfig = ref<FeatureConfig>(
  dwdyState.diary.value.fetchFeatureConfig(DiaryFeature.Sticker)
);
const isModalOn = ref(false);
const diaryEditorSelectorModel = ref();
const displayIconOptions: SelectionOption[] = [
  {
    label: la.t(".category.none") as string,
    value: "none",
    icon: {
      set: "mdi",
      path: mdiChartBubble,
    },
  },
  {
    label: la.t(".category.first") as string,
    value: "first",
    icon: {
      set: "mdi",
      path: mdiNumeric1CircleOutline,
    },
  },
  ...stickerCategories.map((category) => {
    return {
      label: la.t(`.category.${category.code}`) as string,
      value: category.code,
      icon: category.icon,
    };
  }),
];

onMounted(() => {
  isModalOn.value = props.modelValue;
});

watch(
  () => props.modelValue,
  (newValue) => {
    isModalOn.value = newValue;
  }
);

watch(
  () => isModalOn.value,
  () => {
    emit("update:modelValue", isModalOn.value);
  }
);

async function onDisplayIconSelected(category: string): Promise<void> {
  dwdyState.diary.value.patchFeatureConfig(DiaryFeature.Sticker, {
    displayIconTarget: category,
  });
  await dwdyState.diary.value.save();
  isModalOn.value = false;
}
</script>
<template>
  <ModalSelector
    ref="diaryEditorSelectorModel"
    v-model="isModalOn"
    class="fixed z-10"
    modal-id="diary-display-icon-selector"
    :current-value="featureConfig.displayIconTarget"
    :options="displayIconOptions"
    :icon-enabled="true"
    @change="onDisplayIconSelected"
  >
    <template #modal-title>
      <div>
        <h2 class="card-title mb-2">
          <SvgIcon
            class="text-base-content mr-1"
            :icon-set="featureIcon(DiaryFeature.Sticker).set"
            :path="featureIcon(DiaryFeature.Sticker).path"
            :size="24"
          ></SvgIcon>
          {{ la.t(".config.displayIconTarget.name") }}
        </h2>
      </div>
    </template>
  </ModalSelector>
</template>
