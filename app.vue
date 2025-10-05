<template>
  <div class="min-h-screen">
    <!-- Standardized loading screen -->
    <StandardLoadingScreen
      v-if="showHtmlLoading"
      variant="auth"
      :show-progress="false"
    />

    <!-- Vue-level loading screen -->
    <LoadingScreen />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { useLoadingStore } from "~/stores/loading";
import StandardLoadingScreen from "~/components/LoadingScreen/StandardLoadingScreen.vue";
import ToastContainer from "~/components/Toast/ToastContainer.vue";

const loadingStore = useLoadingStore();
const route = useRoute();
const showHtmlLoading = ref(true);

// Hide HTML loading screen when Vue app is ready
onMounted(() => {
  // Hide the HTML loading screen
  setTimeout(() => {
    showHtmlLoading.value = false;
  }, 1000);

  // Give components time to load
  setTimeout(() => {
    loadingStore.stopLoading();
  }, 1500);
});

// Handle route changes - simplified to not interfere with navigation
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath && oldPath) {
      // Don't interfere with navigation - let pages handle their own loading
      // This prevents blocking page navigation
      return;
    }
  }
);
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
</style>
