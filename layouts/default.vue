<template>
  <div>
    <!-- Standardized loading screen -->
    <StandardLoadingScreen
      v-if="showInitialLoading"
      variant="auth"
      :show-progress="true"
      :progress="loadingProgress"
      :progress-text="loadingMessage"
    />

    <!-- Vue-level loading screen -->
    <LoadingScreen />

    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import StandardLoadingScreen from "~/components/LoadingScreen/StandardLoadingScreen.vue";

const showInitialLoading = ref(true);
const loadingProgress = ref(0);
const loadingMessage = ref("Initializing...");

// Start loading immediately
onBeforeMount(() => {
  showInitialLoading.value = true;
  loadingProgress.value = 10;
  loadingMessage.value = "Loading application...";
});

// Progressive loading simulation
onMounted(() => {
  // Simulate loading progress
  const progressSteps = [
    { progress: 20, message: "Loading components..." },
    { progress: 40, message: "Fetching content..." },
    { progress: 60, message: "Loading images..." },
    { progress: 80, message: "Preparing interface..." },
    { progress: 95, message: "Almost ready..." },
    { progress: 100, message: "Ready!" },
  ];

  let currentStep = 0;
  const progressInterval = setInterval(() => {
    if (currentStep < progressSteps.length) {
      const step = progressSteps[currentStep];
      loadingProgress.value = step.progress;
      loadingMessage.value = step.message;
      currentStep++;
    } else {
      clearInterval(progressInterval);
      // Hide loading screen
      setTimeout(() => {
        showInitialLoading.value = false;
      }, 500);
    }
  }, 800); // Update every 800ms

  // Fallback - hide after 8 seconds max
  setTimeout(() => {
    clearInterval(progressInterval);
    showInitialLoading.value = false;
  }, 8000);
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