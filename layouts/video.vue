<template>
  <div class="video-layout">
    <!-- Standardized loading screen - only show briefly -->
    <StandardLoadingScreen
      v-if="showInitialLoading"
      variant="video"
      :show-progress="true"
      :progress="loadingProgress"
      :progress-text="loadingMessage"
    />

    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StandardLoadingScreen from "~/components/LoadingScreen/StandardLoadingScreen.vue";

const showInitialLoading = ref(true);
const loadingProgress = ref(0);
const loadingMessage = ref("Initializing video...");

// Simple, fast loading for video pages
onMounted(() => {
  // Quick loading sequence
  const progressSteps = [
    { progress: 50, message: "Loading video player..." },
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
      // Hide loading screen quickly
      showInitialLoading.value = false;
    }
  }, 300); // Much faster - 300ms per step

  // Fallback - hide after 1.5 seconds max
  setTimeout(() => {
    clearInterval(progressInterval);
    showInitialLoading.value = false;
  }, 1500);
});
</script>

<style scoped>
.video-layout {
  @apply min-h-screen bg-black;
}
</style>
