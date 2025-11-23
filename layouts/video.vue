<template>
  <div class="video-layout">
    <!-- Always show slot - let the page handle its own loading state -->
    <slot />
  </div>
</template>

<script setup>
// Video layout - always render slot, pages handle their own loading
</script>

<style scoped>
.video-layout {
  @apply min-h-screen bg-black;
}
</style>
