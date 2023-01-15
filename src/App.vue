<script setup lang="ts">
import { onMounted } from "vue";
import { useMeta } from "vue-meta";
import AppRoot from "~/AppRoot.vue";

useMeta({
  title: "My Example App",
});

function fixMobile100vh(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

onMounted(() => {
  fixMobile100vh();
  window.addEventListener("resize", () => {
    fixMobile100vh();
  });
});
</script>

<template>
  <metainfo></metainfo>
  <Suspense>
    <AppRoot></AppRoot>
    <template #fallback> Suspense fallback </template>
  </Suspense>
</template>

<style>
body {
  height: 100vh;
  height: calc(var(--vh) * 100);
}

#app {
  position: relative;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>
