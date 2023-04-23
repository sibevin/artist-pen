<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { mdiSortAscending } from "@mdi/js";
import { LocaleActor } from "~/services/locale";
import { useSearchState } from "~/states/useSearchState";
import { sortOptionToQuery, sortQueryToOptions } from "~/services/dwdy/search";
import { searchSortOpts } from "~/dwdy/layout/calendar/map";
import ModalSelector from "~/components/ModalSelector.vue";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", value: string): void;
}>();

const searchState = useSearchState();
const la = new LocaleActor("dwdy.layout.calendar.config.searchSort");
const isModalOn = ref(false);

const sortOption = computed<string>({
  get() {
    const sortOpt = sortQueryToOptions(searchState.query.value)[0];
    if (sortOpt) {
      return sortOpt;
    } else {
      return "timestamp_desc";
    }
  },
  set(value: string) {
    searchState.query.value.sorts = sortOptionToQuery([value]);
  },
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

function onSearchSortChanged(value: string): void {
  sortOption.value = value;
  isModalOn.value = false;
  emit("select", value);
}
</script>
<template>
  <ModalSelector
    v-model="isModalOn"
    modal-id="diary-calendar-search-sort-selector"
    :current-value="sortOption"
    :options="searchSortOpts(la)"
    :icon-enabled="true"
    @change="onSearchSortChanged"
  >
    <template #modal-title>
      <h2 class="card-title mb-4">
        <SvgIcon
          class="mr-1"
          icon-set="mdi"
          :path="mdiSortAscending"
          :size="24"
        ></SvgIcon>
        {{ la.t(".name") }}
      </h2>
    </template>
  </ModalSelector>
</template>
