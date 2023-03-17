<script setup lang="ts">
import { computed } from "vue";
import { useDwdyState } from "~/states/useDwdyState";
import YmdNavPanel from "~/components/dwdy/common/YmdNavPanel.vue";

const dwdyState = useDwdyState();

const currentDt = computed<Date>(() => {
  return dwdyState.entry.value.tsDate || new Date();
});
</script>
<template>
  <YmdNavPanel
    v-if="currentDt"
    :current-date="currentDt"
    :enable-selector="false"
  ></YmdNavPanel>
</template>
