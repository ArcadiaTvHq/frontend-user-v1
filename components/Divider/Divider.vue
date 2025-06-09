<template>
  <div class="md:mt-25 lg:mt-32 overflow-hidden">
    <div class="bg-[#5E5E5E] py-2 md:py-3">
      <div class="flex gap-1 md:gap-3 movie-reel">
        <div
          class="w-[6px] h-[6px] md:w-[20px] md:h-[20px] rounded-[5px] bg-white flex-shrink-0"
          v-for="i in 70"
          :key="i"
        ></div>
      </div>
      <div class="flex gap-2 md:gap-4 my-4 md:my-6 scroll-content w-fit">
        <img
          class="w-[150px] md:w-[214.85px] lg:w-[280px] h-auto aspect-video object-cover rounded"
          v-for="(image, i) in advertImages"
          :src="image"
          :key="i"
          :alt="`Advertisement ${i + 1}`"
        />
      </div>
      <div class="flex gap-1 md:gap-3 movie-reel">
        <div
          class="w-[6px] h-[6px] md:w-[20px] md:h-[20px] rounded-[5px] bg-white flex-shrink-0"
          v-for="i in 70"
          :key="i"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
import img3 from "../../assets/img3.png";
import img4 from "../../assets/img1.png";

const advertImages = ref([
  img1,
  img2,
  img3,
  img4,
  img1,
  img2,
  img3,
  img4,
  img1,
  img2,
  img3,
  img4,
]);
</script>

<style scoped>
.scroll-content {
  animation: scroll-left 20s linear infinite;
  animation-fill-mode: forwards;
  will-change: transform;
}

.scroll-content:hover {
  animation-play-state: paused;
}

@keyframes scroll-left {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

.movie-reel {
  animation: scroll-right 10s linear infinite;
  animation-fill-mode: forwards;
  will-change: transform;
}

@keyframes scroll-right {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-10%, 0, 0);
  }
}

@media (max-width: 768px) {
  .scroll-content {
    animation-duration: 15s;
  }

  .movie-reel {
    animation-duration: 8s;
  }
}
</style>