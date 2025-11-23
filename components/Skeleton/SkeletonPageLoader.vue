<template>
  <div class="skeleton-page-loader">
    <div class="skeleton-header">
      <div class="skeleton-logo"></div>
      <div class="skeleton-nav">
        <div class="skeleton-nav-item" v-for="n in 5" :key="n"></div>
      </div>
    </div>
    <div class="skeleton-hero">
      <div class="skeleton-hero-content">
        <div class="skeleton-hero-title"></div>
        <div class="skeleton-hero-text"></div>
        <div class="skeleton-hero-button"></div>
      </div>
    </div>
    <div class="skeleton-sections">
      <div class="skeleton-section" v-for="n in 3" :key="n">
        <div class="skeleton-section-header">
          <div class="skeleton-section-title"></div>
        </div>
        <SkeletonCardGrid :count="6" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonCardGrid from "./SkeletonCardGrid.vue";
</script>

<style scoped>
.skeleton-page-loader {
  @apply fixed inset-0 min-h-screen bg-black z-[9999];
}

.skeleton-header {
  @apply flex items-center justify-between px-4 sm:px-9 md:px-28 py-4;
}

.skeleton-logo {
  @apply w-24 h-12 bg-gray-800 rounded animate-pulse;
}

.skeleton-nav {
  @apply flex items-center gap-4;
}

.skeleton-nav-item {
  @apply w-16 h-6 bg-gray-800 rounded animate-pulse;
}

.skeleton-hero {
  @apply px-4 sm:px-9 md:px-28 py-12 md:py-20;
}

.skeleton-hero-content {
  @apply max-w-2xl space-y-4;
}

.skeleton-hero-title {
  @apply h-12 bg-gray-800 rounded animate-pulse;
}

.skeleton-hero-text {
  @apply h-6 bg-gray-800 rounded animate-pulse w-3/4;
}

.skeleton-hero-button {
  @apply h-12 w-32 bg-gray-800 rounded animate-pulse;
}

.skeleton-sections {
  @apply px-4 sm:px-9 md:px-28 space-y-12;
}

.skeleton-section {
  @apply space-y-6;
}

.skeleton-section-header {
  @apply flex items-center gap-4;
}

.skeleton-section-title {
  @apply h-8 w-48 bg-gray-800 rounded animate-pulse;
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
