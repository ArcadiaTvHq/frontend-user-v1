<template>
  <div
    v-if="isNavigating"
    class="skeleton-navigation-loader"
  >
      <div class="skeleton-navbar">
        <div class="skeleton-navbar-content">
          <div class="skeleton-logo"></div>
          <div class="skeleton-nav-links">
            <div class="skeleton-nav-link" v-for="n in 5" :key="n"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-hero">
          <div class="skeleton-hero-content">
            <div class="skeleton-line w-3/4 h-8"></div>
            <div class="skeleton-line w-1/2 h-6"></div>
          </div>
        </div>
        <div class="skeleton-sections">
          <div class="skeleton-section" v-for="n in 2" :key="n">
            <div class="skeleton-section-header">
              <div class="skeleton-line w-32 h-6"></div>
            </div>
            <SkeletonCardGrid :count="6" />
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import SkeletonCardGrid from "./SkeletonCardGrid.vue";

const props = defineProps({
  isNavigating: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.skeleton-navigation-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  background-color: #000000;
  z-index: 99999;
  overflow-y: auto;
  /* Remove any transitions for instant display */
  animation: none;
  transition: none;
}

.skeleton-navbar {
  @apply w-full bg-black/90 backdrop-blur-sm border-b border-gray-800;
}

.skeleton-navbar-content {
  @apply px-4 sm:px-9 md:px-28 py-4 flex items-center justify-between;
}

.skeleton-logo {
  @apply w-24 h-12 bg-gray-800 rounded animate-pulse;
}

.skeleton-nav-links {
  @apply flex items-center gap-4;
}

.skeleton-nav-link {
  @apply w-16 h-6 bg-gray-800 rounded animate-pulse;
}

.skeleton-content {
  @apply px-4 sm:px-9 md:px-28 py-8 space-y-12;
}

.skeleton-hero {
  @apply space-y-4;
}

.skeleton-hero-content {
  @apply space-y-3;
}

.skeleton-line {
  @apply bg-gray-800 rounded animate-pulse;
}

.skeleton-sections {
  @apply space-y-12;
}

.skeleton-section {
  @apply space-y-6;
}

.skeleton-section-header {
  @apply mb-6;
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
