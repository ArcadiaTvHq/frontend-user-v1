<template>
  <section class="px-9 md:px-28 flex flex-col gap-7 mt-20 font-orbitron">
    <div class="flex justify-center items-center gap-1 metaText">
      <img src="../../assets/flame.png">
      <h6 class="text-textprimary md:text-h6">Trending</h6>
      <div class="border-grayish flex flex-1 h-0 w-[165.4px] shhrink border-[0.85px]"></div>
      <p class="text-textprimary text-smallest  md:text-seemore">See More</p>
    </div>
    <div class="grid grid-cols-3 gap-3 md:gap-7 md:grid-cols-4 lg:grid-cols-6 text-textprimary tileHolder">
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div >
      <div class="scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="hidden md:block scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="hidden md:block scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>
      <div class="hidden md:block scale">
        <img class="grid grid-cols-3" src="../../assets/movie.png">
        <p>Guardian of the galaxy</p>
        <span>2020 <span>2hrs</span></span>
      </div>

      
    </div>
  </section>
</template>

<style scoped>


  .scale:hover{
    animation: scale 0.3s linear forwards;
    cursor: pointer;
  }

  @keyframes scale {
    to{
      transform: scale(1.3);
    }
    
  }
</style>

<script setup>
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
  onMounted(()=>{
    gsap.registerPlugin(ScrollTrigger)
    
    const metaText = document.querySelector(".metaText")
    const metaTile = document.querySelector('.tileHolder')

    const tl = gsap.timeline({
      scrollTrigger:{
        trigger: metaText,
        start:'top bottom',
        end: 'bottom 90%',
        scrub: true,

        duration: 2
      }
    })

    tl.fromTo(metaText,{
      xPercent: -100,
      opacity: 0
    },
  {
    xPercent: 0,
    opacity: 1
  })

  const tlTile = gsap.timeline({
      scrollTrigger:{
        trigger: metaTile,
        start:'top bottom',
        end: 'bottom 90%',
        scrub: false,
        duration: 1
      }
    })

    tlTile.fromTo(metaTile, {
      yPercent: 50,
      opacity:0
    },
  {
    yPercent: 0,
    opacity:1
  })

  })
</script>