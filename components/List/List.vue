<template>
  <div class="flex gap-1 md:gap-4 font-inter">
    <img class="size-[10.21px] md:size-4" src="../../assets/Vector.png">
    <p class="text-tiny md:text-small">{{ benefit }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['benefit'])

</script>