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
const isLoading = ref(true);

// Hide loader after initial mount
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 0);
});

// Expose isLoading to window for middleware access
if (process.client) {
  window.__nuxt_loading = isLoading;
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

#__nuxt {
  background-color: black;
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
