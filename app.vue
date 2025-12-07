<template>
  <!-- Always render NuxtLayout and NuxtPage first -->
  <!-- DO NOT add keys - they cause remounts -->
  <!-- Use KeepAlive only for detail pages, exclude video pages -->
  <NuxtLayout>
    <KeepAlive
      :include="['watch-slug']"
      :exclude="['watch-video', 'watch-trailer']"
    >
      <NuxtPage />
    </KeepAlive>
  </NuxtLayout>

  <!-- Skeleton loader for initial HTML load (overlay) -->
  <SkeletonPageLoader v-if="showHtmlLoading" />

  <!-- Global navigation skeleton loader (shows during route transitions) -->
  <SkeletonNavigationLoader :is-navigating="isNavigating" />

  <!-- Vue-level loading screen -->
  <LoadingScreen />

  <!-- Global Toast Container -->
  <ToastContainer />
</template>

<script setup>
import { useLoadingStore } from "~/stores/loading";
import SkeletonPageLoader from "~/components/Skeleton/SkeletonPageLoader.vue";
import SkeletonNavigationLoader from "~/components/Skeleton/SkeletonNavigationLoader.vue";
import ToastContainer from "~/components/Toast/ToastContainer.vue";

const loadingStore = useLoadingStore();
const route = useRoute();
const router = useRouter();
const showHtmlLoading = ref(true);
const isNavigating = ref(false);

// Track if app has mounted to prevent remounts
// Use a global flag that persists across navigations
const hasAppMounted = ref(false);

// Use onMounted with a check to ensure it only runs once
// Store the mounted state in a way that persists across potential remounts
const globalMountedKey = "__nuxt_app_mounted__";

onMounted(() => {
  if (process.client) {
    // Use window to store mounted state across remounts
    // Access window properties using getItem/setItem pattern to avoid parsing issues
    let wasMounted = false;
    try {
      wasMounted =
        window[globalMountedKey] === true || hasAppMounted.value === true;
    } catch (e) {
      wasMounted = hasAppMounted.value === true;
    }

    if (!wasMounted) {
      hasAppMounted.value = true;
      try {
        window[globalMountedKey] = true;
      } catch (e) {
        // Ignore if window access fails
      }

      // Hide the HTML loading screen
      setTimeout(() => {
        showHtmlLoading.value = false;
      }, 1000);

      // Give components time to load
      setTimeout(() => {
        loadingStore.stopLoading();
      }, 1500);
    } else {
      // App was already mounted - this is a remount, hide loading immediately
      hasAppMounted.value = true;
      showHtmlLoading.value = false;
    }
  } else {
    // Server-side: just set the flag
    if (!hasAppMounted.value) {
      hasAppMounted.value = true;
      setTimeout(() => {
        showHtmlLoading.value = false;
      }, 1000);
      setTimeout(() => {
        loadingStore.stopLoading();
      }, 1500);
    } else {
      showHtmlLoading.value = false;
    }
  }
});

// Watch for route changes to show navigation skeleton
let navigationTimeout = null;

// Use router navigation hooks for better control
router.beforeEach((to, from) => {
  // Only show skeleton if navigating to a different route
  if (to.path !== from.path) {
    // Show skeleton IMMEDIATELY - synchronous, no delay
    // Set directly without any async operations
    isNavigating.value = true;

    // Clear any existing timeout
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
      navigationTimeout = null;
    }
  }
});

router.afterEach(() => {
  // Hide navigation skeleton after route is resolved
  // Use nextTick to ensure DOM is updated first
  nextTick(() => {
    // Give pages time to mount and show their own skeletons
    // For video pages, wait a bit longer to ensure content is loaded
    const isVideoPage = route.path.includes("/video");
    const delay = isVideoPage ? 100 : 200;

    navigationTimeout = setTimeout(() => {
      isNavigating.value = false;
      navigationTimeout = null;
    }, delay);
  });
});

// Listen for page-loaded event from video pages
if (process.client) {
  window.addEventListener("page-loaded", () => {
    // Immediately clear navigation skeleton when page signals it's ready
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
      navigationTimeout = null;
    }
    isNavigating.value = false;
  });
}

// Also watch route path as a fallback for immediate response
// This ensures skeleton shows even if router hooks are delayed
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath && oldPath) {
      // Show skeleton immediately on any route change
      // Use requestAnimationFrame for instant visual update
      requestAnimationFrame(() => {
        isNavigating.value = true;
      });
    }
  },
  { immediate: false }
);
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background-color: #000000;
  /* Prevent white screen flash during navigation */
  overflow-x: hidden;
}

#__nuxt {
  min-height: 100vh;
  background-color: #000000;
}
</style>
