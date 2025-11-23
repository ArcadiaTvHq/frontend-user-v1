<template>
  <div class="skeleton-card">
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta">
        <div class="skeleton-meta-item"></div>
        <div class="skeleton-meta-item"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton card component for content cards
</script>

<style scoped>
.skeleton-card {
  @apply flex flex-col;
}

.skeleton-image {
  @apply w-full aspect-[3/4] rounded-lg bg-gray-800 animate-pulse;
}

.skeleton-content {
  @apply flex flex-col justify-between p-2 mt-3;
}

.skeleton-title {
  @apply h-[32px] bg-gray-800 rounded animate-pulse mb-2;
}

.skeleton-meta {
  @apply flex items-center gap-2;
}

.skeleton-meta-item {
  @apply h-[14px] w-20 bg-gray-800 rounded animate-pulse;
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
