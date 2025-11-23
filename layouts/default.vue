<template>
  <div>
    <!-- Skeleton loader for initial page load (overlay) -->
    <SkeletonPageLoader v-if="showInitialLoading" />

    <!-- Vue-level loading screen -->
    <LoadingScreen />

    <!-- Always show slot so NuxtPage is always visible -->
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SkeletonPageLoader from "~/components/Skeleton/SkeletonPageLoader.vue";

const showInitialLoading = ref(true);
const hasMounted = ref(false);

// Only run onMounted once - not on every navigation
onMounted(() => {
  // Only show initial loading on first mount, not on navigation
  if (!hasMounted.value) {
    hasMounted.value = true;
    // Hide skeleton loader quickly to avoid white screen
    setTimeout(() => {
      showInitialLoading.value = false;
    }, 300);
  } else {
    // On subsequent navigations, don't show loading
    showInitialLoading.value = false;
  }
});
</script>

<style scoped>
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