<template>
  <div class="skeleton-video-loader">
    <div class="skeleton-video-player">
      <div class="skeleton-video-content"></div>
    </div>
    <div class="skeleton-video-info">
      <div class="skeleton-video-title"></div>
      <div class="skeleton-video-meta">
        <div class="skeleton-meta-item" v-for="n in 3" :key="n"></div>
      </div>
      <div class="skeleton-video-description">
        <div class="skeleton-line" v-for="n in 4" :key="n"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loader for video pages
</script>

<style scoped>
.skeleton-video-loader {
  @apply min-h-screen bg-black;
}

.skeleton-video-player {
  @apply w-full aspect-video bg-gray-900 relative;
}

.skeleton-video-content {
  @apply w-full h-full bg-gray-800 animate-pulse;
}

.skeleton-video-info {
  @apply px-4 sm:px-9 md:px-28 py-8 space-y-4;
}

.skeleton-video-title {
  @apply h-10 w-3/4 bg-gray-800 rounded animate-pulse;
}

.skeleton-video-meta {
  @apply flex items-center gap-4;
}

.skeleton-meta-item {
  @apply h-6 w-24 bg-gray-800 rounded animate-pulse;
}

.skeleton-video-description {
  @apply space-y-2;
}

.skeleton-line {
  @apply h-4 bg-gray-800 rounded animate-pulse;
}

.skeleton-line:last-child {
  @apply w-2/3;
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
