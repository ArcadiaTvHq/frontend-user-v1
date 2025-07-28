<template>
  <div class="min-h-screen">
    <!-- Loading screen with v-show -->
    <div
      v-show="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <img
        class="w-[100px] h-[100px] object-contain animate-pulse"
        src="@/assets/logo2.png"
        alt="Logo"
      />
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useLoadingStore } from "~/stores/loading";

const loadingStore = useLoadingStore();
const isLoading = computed(() => loadingStore.isLoading);

// Hide loader after initial mount
onMounted(() => {
  setTimeout(() => {
    loadingStore.stopLoading();
  }, 1000); // Give it a bit more time to load
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

#__nuxt {
  min-height: 100vh;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
