<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 sm:gap-7 md:gap-10"
  >
    <SkeletonCard v-for="n in count" :key="n" />
  </div>
</template>

<script setup>
import SkeletonCard from "./SkeletonCard.vue";

const props = defineProps({
  count: {
    type: Number,
    default: 6,
  },
});
</script>
