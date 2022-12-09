<script setup lang="ts">
import { ref } from "vue";
import { useMeta } from "vue-meta";
import { initAppConfig } from "~/services/flow/initAppConfig";
import { initEsState } from "~/services/flow/auth";
import { initDwdyConfig } from "~/services/flow/initDwdyConfig";
import { useAppState } from "~/states/useAppState";

useMeta({
  title: "My Example App",
});

await initAppConfig();
await initEsState();
await initDwdyConfig();

const appState = useAppState();
const reloadKey = ref(1);

function reloadPage() {
  reloadKey.value = reloadKey.value * -1;
}
</script>

<template>
  <div class="absolute inset-0" :data-theme="appState.config.value.doc.theme">
    <RouterView
      v-slot="{ Component }"
      :key="reloadKey"
      @reload-page="reloadPage"
    >
      <template v-if="Component">
        <Transition>
          <Suspense>
            <!-- main content -->
            <component :is="Component"></component>

            <!-- loading state -->
            <template #fallback> Loading... </template>
          </Suspense>
        </Transition>
      </template>
    </RouterView>
  </div>
</template>

<style scoped>
.page-tran-enter-active,
.page-tran-leave-active {
  transition: all 0.3s ease;
}
.page-tran-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.page-tran-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
