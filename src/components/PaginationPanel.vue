<script setup lang="ts">
import { computed } from "vue";
import { mdiChevronLeft, mdiChevronRight, mdiDotsHorizontal } from "@mdi/js";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  totalPage: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits<{
  (e: "select", page: number): void;
  (e: "currentSelect"): void;
}>();

const showCurrentPage = computed<boolean>(() => {
  return props.totalPage > 0;
});

const showFirstPage = computed<boolean>(() => {
  return props.currentPage > 1;
});

const showPreviousPage = computed<boolean>(() => {
  return props.currentPage - 1 > 1;
});

const showNextPage = computed<boolean>(() => {
  return props.currentPage + 1 < props.totalPage;
});

const showLastPage = computed<boolean>(() => {
  return props.currentPage < props.totalPage;
});

const showFirstDots = computed<boolean>(() => {
  return props.currentPage > 3;
});

const showLastDots = computed<boolean>(() => {
  if (props.totalPage <= 2) {
    return false;
  }
  return props.currentPage < props.totalPage - 2;
});

const enablePreviousArrow = computed<boolean>(() => {
  return props.currentPage - 1 > 0;
});

const enableNextArrow = computed<boolean>(() => {
  return props.currentPage < props.totalPage;
});

function onPageSelected(page: number): void {
  emit("select", page);
}

function onCurrentPageSelected(): void {
  emit("currentSelect");
}
</script>
<template>
  <div class="flex justify-center items-center">
    <button
      v-if="props.totalPage > 1"
      class="p-2"
      :class="{ 'text-base-300': !enablePreviousArrow }"
      :disabled="!enablePreviousArrow"
      @click="onPageSelected(props.currentPage - 1)"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronLeft" :size="20"></SvgIcon>
    </button>
    <div class="min-w-[18rem] btn-group justify-center">
      <button
        v-if="showFirstPage"
        class="btn btn-sm btn-outline hover:bg-base-100 hover:text-base-content"
        @click="onPageSelected(1)"
      >
        1
      </button>
      <button
        v-if="showFirstDots"
        class="btn btn-sm btn-outline hover:bg-base-100 hover:text-base-content"
      >
        <SvgIcon
          class="text-base-300"
          icon-set="mdi"
          :path="mdiDotsHorizontal"
          :size="16"
        ></SvgIcon>
      </button>
      <button
        v-if="showPreviousPage"
        class="btn btn-sm btn-outline hover:bg-base-100 hover:text-base-content"
        @click="onPageSelected(props.currentPage - 1)"
      >
        {{ props.currentPage - 1 }}
      </button>
      <button
        v-if="showCurrentPage"
        class="btn btn-sm"
        @click="onCurrentPageSelected"
      >
        {{ props.currentPage }}
      </button>
      <button
        v-if="showNextPage"
        class="btn btn-sm btn-outline hover:bg-base-100 hover:text-base-content"
        @click="onPageSelected(props.currentPage + 1)"
      >
        {{ props.currentPage + 1 }}
      </button>
      <button
        v-if="showLastDots"
        class="btn btn-sm btn-outline hover:bg-base-100 hover:text-base-content"
      >
        <SvgIcon
          class="text-base-300"
          icon-set="mdi"
          :path="mdiDotsHorizontal"
          :size="16"
        ></SvgIcon>
      </button>
      <button
        v-if="showLastPage"
        class="btn btn-sm btn-outline hover:bg-base-100 hover:text-base-content"
        @click="onPageSelected(props.totalPage)"
      >
        {{ props.totalPage }}
      </button>
      <slot name="right-appending"></slot>
    </div>
    <button
      v-if="props.totalPage > 1"
      class="p-2"
      :class="{ 'text-base-300': !enableNextArrow }"
      :disabled="!enableNextArrow"
      @click="onPageSelected(props.currentPage + 1)"
    >
      <SvgIcon icon-set="mdi" :path="mdiChevronRight" :size="20"></SvgIcon>
    </button>
  </div>
</template>
