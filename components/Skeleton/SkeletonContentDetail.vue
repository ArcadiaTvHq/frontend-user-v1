<template>
  <div class="skeleton-content-detail">
    <!-- Navbar skeleton placeholder -->
    <div class="skeleton-navbar">
      <div class="skeleton-navbar-content">
        <div class="skeleton-logo"></div>
        <div class="skeleton-nav-links">
          <div class="skeleton-nav-link" v-for="n in 5" :key="n"></div>
        </div>
      </div>
    </div>
    <div class="skeleton-hero">
      <div class="skeleton-hero-image"></div>
      <div class="skeleton-hero-overlay"></div>
      <div class="skeleton-hero-content">
        <div class="skeleton-poster"></div>
        <div class="skeleton-info">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta">
            <div class="skeleton-meta-item" v-for="n in 3" :key="n"></div>
          </div>
          <div class="skeleton-description">
            <div class="skeleton-line" v-for="n in 5" :key="n"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="skeleton-sections">
      <div class="skeleton-section">
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
.skeleton-content-detail {
  @apply fixed inset-0 min-h-screen bg-black z-[9998];
  overflow-y: auto;
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

.skeleton-hero {
  @apply relative w-full min-h-[70vh] overflow-hidden;
}

.skeleton-hero-image {
  @apply absolute inset-0 bg-gray-900 animate-pulse;
}

.skeleton-hero-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10;
}

.skeleton-hero-content {
  @apply relative z-20 px-4 sm:px-9 md:px-28 py-12 md:py-20 flex flex-col md:flex-row gap-8 items-start;
}

.skeleton-poster {
  @apply w-48 md:w-64 lg:w-80 aspect-[3/4] bg-gray-800 rounded-lg animate-pulse flex-shrink-0;
}

.skeleton-info {
  @apply flex-1 space-y-4 max-w-2xl;
}

.skeleton-title {
  @apply h-10 w-3/4 bg-gray-800 rounded animate-pulse;
}

.skeleton-meta {
  @apply flex items-center gap-4 flex-wrap;
}

.skeleton-meta-item {
  @apply h-6 w-24 bg-gray-800 rounded animate-pulse;
}

.skeleton-description {
  @apply space-y-2 mt-4;
}

.skeleton-line {
  @apply h-4 bg-gray-800 rounded animate-pulse;
}

.skeleton-line:last-child {
  @apply w-2/3;
}

.skeleton-actions {
  @apply flex items-center gap-4 mt-6;
}

.skeleton-button {
  @apply h-12 w-32 bg-gray-800 rounded animate-pulse;
}

.skeleton-sections {
  @apply px-4 sm:px-9 md:px-28 py-12 space-y-12;
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
