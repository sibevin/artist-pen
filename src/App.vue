<script setup lang="ts">
import { useMeta } from "vue-meta";
import AppRoot from "~/AppRoot.vue";

useMeta({
  title: "My Example App",
});
</script>

<template>
  <metainfo></metainfo>
  <Suspense>
    <AppRoot></AppRoot>
    <template #fallback> Suspense fallback </template>
  </Suspense>
</template>
