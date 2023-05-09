<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { mdiClock, mdiCheck, mdiClose } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { SearchDateRangeQuery } from "~/types/dwdy/search";
import { dsToDt, dtToEntryTs } from "~/services/dwdy/dateUtils";
import DateRangeSelector from "~/components/input/DateRangeSelector.vue";
import DateRangePanel from "~/components/panels/DateRangePanel.vue";
import ModalBase from "~/components/ModalBase.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", value: SearchDateRangeQuery): void;
}>();

const MODAL_ID = "layout-calendar-search-main";
const searchState = useSearchState();
const la = new LocaleActor("dwdy.layout.calendar.components.search");
const isModalOn = ref(false);
const dateRangeQuery = ref<SearchDateRangeQuery>();

const isDateRangeValid = computed<boolean>(() => {
  if (!dateRangeQuery.value) {
    return true;
  }
  return dateRangeQuery.value.valid;
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

onMounted(() => {
  isModalOn.value = props.modelValue;
});

function onApplyBtnClicked(): void {
  if (!dateRangeQuery.value) {
    isModalOn.value = false;
    return;
  }
  const [fromDs, toDs] = dateRangeQuery.value.value.split("_");
  const fromTs =
    fromDs && fromDs !== "" ? dtToEntryTs(dsToDt(fromDs)) : undefined;
  const toTs = toDs && toDs !== "" ? dtToEntryTs(dsToDt(toDs)) : undefined;
  if (!fromTs && !toTs) {
    searchState.query.value.timestampRange = undefined;
    isModalOn.value = false;
    return;
  }
  searchState.query.value.timestampRange = {
    mark: dateRangeQuery.value.mark,
    display: dateRangeQuery.value.display,
    query: dateRangeQuery.value.value,
  };
  isModalOn.value = false;
  emit("select", dateRangeQuery.value);
}

function onDateRangeSelected(query: SearchDateRangeQuery): void {
  dateRangeQuery.value = query;
}
</script>
<template>
  <ModalBase
    ref="diaryEditorSelectorModel"
    v-model="isModalOn"
    class="fixed z-10 modal-w-2xl"
    :modal-base-id="MODAL_ID"
  >
    <template #modal-title>
      <h2 class="card-title mb-2">
        <SvgIcon
          class="text-base-content mr-1"
          icon-set="mdi"
          :path="mdiClock"
          :size="24"
        ></SvgIcon>
        {{ la.t(".timeRange") }}
      </h2>
    </template>
    <template #modal-content>
      <div class="p-3 border rounded-lg">
        <DateRangeSelector @select="onDateRangeSelected"></DateRangeSelector>
      </div>
    </template>
    <template #modal-fixed-bottom-panel>
      <div class="w-full flex justify-center">
        <DateRangePanel
          class="mt-3"
          :date-range="dateRangeQuery?.value"
        ></DateRangePanel>
      </div>
      <div class="card-actions mt-2 items-center">
        <div class="grow flex items-center">
          <button
            class="btn btn-primary"
            :disabled="!isDateRangeValid"
            @click="onApplyBtnClicked"
          >
            <SvgIcon
              class="mr-2"
              icon-set="mdi"
              :path="mdiCheck"
              :size="16"
            ></SvgIcon>
            {{ la.t("app.action.apply") }}
          </button>
          <label class="btn btn-ghost ml-2" :for="`modal-base_${MODAL_ID}`">
            <SvgIcon
              class="text-base-content mr-2"
              icon-set="mdi"
              :path="mdiClose"
              :size="16"
            ></SvgIcon>
            {{ la.t("app.action.cancel") }}
          </label>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
