<template>
  <div class="mt-15 md:mt-32 overflow-hidden">
    <div class="bg-[#5E5E5E] pl-1 py-1 md:py-3">
      <div class="flex gap-1 md:gap-3 movie-reel">
        <div class="size-[9.38px] md:size-5 rounded-[5px] bg-white flex shrink-0" v-for="i in 70" :key="i"></div>
        
        
      </div>
      <div class="flex  border-white gap-1 my-[10.32px] scroll-content w-fit">
        <img class="max-w-[214.85px] md:w-114 md:max-w-114 h-24 md:h-51 box" v-for="i in 8 " :src="advertImages[i]" :key="i">
        
      </div>
      <div class="flex gap-1 md:gap-3  movie-reel">
        <div class="size-[9.38px] md:size-5 rounded-[5px] bg-white flex shrink-0"  v-for="i in 70" :key="i"></div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import img1 from "../../assets/img1.png"
import img2 from "../../assets/img2.png"
import img3 from "../../assets/img3.png"
import img4 from "../../assets/img1.png"

  const advertImages = ref([img1, img2, img3, img4,img1, img2, img3, img4, img1, img2, img3, img4 ])

  
  
</script>

<style scoped>
.scroll-content {
  animation: scroll-left 10s linear infinite;
  animation-fill-mode: forwards;
}
.scroll-content:hover {
  animation-play-state: paused;
  
}
@keyframes scroll-left {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100%{
    transform: translate3d(-50%, 0, 0)
  }
}

@keyframes scroll-right {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100%{
    transform: translate3d(-10%,0,0)
  }
}

.movie-reel{
  animation:scroll-right 1s linear infinite;
  animation-fill-mode: forwards;
}

</style>