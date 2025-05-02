<template>
  <section class="px-9 md:px-28 flex flex-col gap-7 mt-20 font-orbitron">
    <div class="flex justify-center items-center gap-1 metaText">
      <img class="size-[35px]" src="../../assets/flame.svg">
      <h6 class="text-textprimary md:text-h6">Anticipate</h6>
      <div class=" hidden border-grayish flex flex-1 h-0 w-[165.4px] shhrink border-[0.85px]"></div>
      <p class=" hidden text-textprimary text-smallest  md:text-seemore">See More</p>
    </div>
    <div class="grid grid-cols-2 gap-3 md:gap-7 md:grid-cols-3 lg:grid-cols-6 text-textprimary tileHolder">
      <div class="miniplayer" @mouseenter="e => preview(e)" @mouseleave="e=>close(e)" v-for="i in 6" :key="i" :id="i">
        <div class="mini-display" hidden="true" >
          <img src="@/assets/hoverimage.jpg">
          <div class="px-4 below">
            <p class="font-semibold lg:text-seemore text-tiny ">The protectors of the galaxy and their goofy adventures</p>
          </div>
        </div>
        <div>
          <img class="grid grid-cols-3 scale" src="../../assets/movie.png">
          <p class="font-semibold lg:text-seemore text-small new">Guardian of the galaxy</p>
          <span class="font-inter text-tiny lg:text-small ">2020 <span>2hrs</span></span>
        </div>
      </div>

      
    </div>
  </section>
</template>

<style scoped>

  @media screen and (max-width: 750px) {
    .miniplayer:nth-child(1n):hover{
    animation: move-center 0.5s forwards linear
  }
  .miniplayer:nth-child(2n):hover{
    animation: move-centerl 0.5s forwards linear
  }
  }

  .miniplayer:nth-child(1):hover{
    animation: move-center 0.5s forwards linear
  }
  .miniplayer:last-child:hover{
    animation: move-centerl 0.5s forwards linear
  }

  @keyframes move-centerl {
    to{
      transform: translateX(-50%);  
    }
  } 

  @keyframes move-center {
    to{
      transform: translateX(50%);  
    }
  } 
    

  .mini-display{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 70%;
    animation: fitsize 1s forwards linear;
    color: white;
    background-color: var(--color-gold);
    
  }
  .mini-display img{
    height: 50%;
    width: 100%;
  }
  @keyframes fitsize{
    to{
      transform: scale3d(2, 1.5, 0.5)
    }
  }

  
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
import hoverimage from '@/assets/hoverimage.jpg'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
const display = ref(false)
const preview = (e) =>{
    const child = e.target.firstElementChild
    const hide = e.target.lastElementChild
    console.log(hide)
    hide.hidden =true
    child.hidden = false
  }
  const close =(e) =>{
    const child = e.target.firstElementChild
    const hide = e.target.lastElementChild
    hide.hidden = false
    child.hidden = true
  }
  onMounted(()=>{
    const player = document.querySelectorAll('.miniplayer')
    console.log(player)

    

    
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