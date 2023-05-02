<script setup lang="ts">
import { ref, watch, PropType } from "vue";
import { mdiClockOutline } from "@mdi/js";
import { entryTsToDt } from "~/services/dwdy/dateUtils";
import { Diary } from "~/models/dwdy/diary";
import SvgIcon from "~/components/SvgIcon.vue";

const props = defineProps({
  diary: {
    type: Object as PropType<Diary>,
    required: true,
  },
});

const lastDateStr = ref<string>();

async function fetchLastContentDate() {
  const lastEntry = await props.diary.lastEntry;
  if (lastEntry && lastEntry.doc.timestamp) {
    const lastDate = entryTsToDt(lastEntry.doc.timestamp);
    lastDateStr.value = lastDate.toISOString().slice(0, 10);
  }
}

fetchLastContentDate();

watch(
  () => props.diary,
  () => {
    fetchLastContentDate();
  }
);
</script>
<template>
  <div v-if="lastDateStr" class="text-base-600 flex items-center">
    <SvgIcon
      class="mr-2"
      icon-set="mdi"
      :path="mdiClockOutline"
      :size="24"
    ></SvgIcon>
    <div class="mr-6 text-xl">
      {{ lastDateStr }}
    </div>
  </div>
</template>
