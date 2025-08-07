<template>
  <div class="min-h-screen">
    <!-- HTML-level loading screen (shows immediately) -->
    <div
      id="html-loading"
      class="fixed inset-0 bg-black z-[99999] flex items-center justify-center"
      style="display: flex !important"
    >
      <div class="text-center">
        <img
          class="w-[100px] h-[100px] object-contain animate-pulse mb-4"
          src="@/assets/logo2.png"
          alt="Logo"
        />
        <p class="text-white text-lg font-medium">Welcome to Arcadia</p>
      </div>
    </div>

    <!-- Vue-level loading screen -->
    <LoadingScreen />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useLoadingStore } from "~/stores/loading";

const loadingStore = useLoadingStore();
const route = useRoute();

// Hide HTML loading screen when Vue app is ready
onMounted(() => {
  // Hide the HTML loading screen
  const htmlLoading = document.getElementById("html-loading");
  if (htmlLoading) {
    setTimeout(() => {
      htmlLoading.style.opacity = "0";
      htmlLoading.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        if (htmlLoading.parentNode) {
          htmlLoading.parentNode.removeChild(htmlLoading);
        }
      }, 500);
    }, 1000);
  }

  // Give components time to load
  setTimeout(() => {
    loadingStore.stopLoading();
  }, 1500);
});

// Handle route changes - only show loading for pages that need it
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath && oldPath) {
      // Don't start loading for pages that don't need API calls
      if (loadingStore.pagesWithoutLoading.includes(newPath)) {
        return;
      }

      // Don't start route loading for navigation between watch pages
      if (newPath === "/watch" && oldPath.startsWith("/watch/")) {
        return;
      }

      // Start route loading for pages that need API calls
      loadingStore.startRouteLoading();

      // Stop route loading after a short delay
      // In practice, components will call stopRouteLoading when ready
      setTimeout(() => {
        loadingStore.stopRouteLoading();
      }, 2000);
    }
  }
);

// Clear loading components on route change
watch(
  () => route.path,
  () => {
    loadingStore.clearLoadingComponents();
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

#html-loading {
  transition: opacity 0.5s ease;
}

#html-loading img {
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
