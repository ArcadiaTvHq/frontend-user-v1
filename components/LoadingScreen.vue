<template>
  <!-- LoadingScreen component - now hidden as we use skeleton loaders instead -->
  <!-- This component is kept for compatibility but doesn't render anything -->
</template>

<script setup>
import { computed } from "vue";

// Only show this loading screen during initial app load
// Page-specific loading should use their own standardized loading screens
const isInitialLoading = ref(true);

// Detect if user is coming from external source
const isExternalNavigation = computed(() => {
  if (typeof window === "undefined") return false;

  const referrer = document.referrer;
  if (!referrer) return true; // No referrer means external or direct navigation

  try {
    const referrerUrl = new URL(referrer);
    const currentUrl = new URL(window.location.href);
    return referrerUrl.origin !== currentUrl.origin;
  } catch {
    return true; // If URL parsing fails, assume external
  }
});

// Set appropriate title based on navigation type
const loadingTitle = computed(() => {
  if (isExternalNavigation.value) {
    return "Welcome to Arcadia";
  }
  return "Loading...";
});

onMounted(() => {
  setTimeout(() => {
    isInitialLoading.value = false;
  }, 2000); // Wait for initial app load to complete
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
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