<template>
  <section class="bg-[url(../../assets/effect.png)] text-textprimary font-orbitron flex flex-col gap-4 lg:gap-11 pt-[30px] items-center overflow-x-hidden holder">
    <h1 class="font-bold text-[24px] text-center  text-white px-13 w-full lg:text-big md:px-36">{{ text }}</h1>

    <p class="text-[12px] text-white text-center px-4 lg:px-28 md:text-small md:font-medium">{{small}}</p>
    <button class="cursor-pointer bg-gold text-cod w-fit p-5 flex items-center md:w-49 md:h-[50px] rounded-[6.53px] h-[32.6px] font-extrabold">
      Join the waitlist
    </button>
    <div class="flex gap-[6.39px] mt-[38.41px] items-center pb-1 flex-1 overflow-hidden">
      
      <div class="scroller w-fit flex gap-5 items-center justify-center">
        <div class=" md:flex w-[285px] h-[310px] toslide ">
        <img class="" src="@/assets/display2.png  ">
      </div>
        <div class="md:flex w-[360px] h-[390px] toslide ">
        <img class="" src="@/assets/display1.png">
      </div>
      <div class=" md:flex w-[471px] h-[512px] toslide ">
        <img class="" src="@/assets/display3.png">
      </div>
      <div class=" md:flex w-[360px] h-[390px] toslide ">
        <img class="" src="@/assets/display2.png ">
      </div>
      <div class=" md:flex  max-h-[500px] w-[285px] h-[310px] toslide ">
        <img src="@/assets/display1.png">
      </div>
      </div>
    </div>
  </section>

</template>

<style scoped>  
/* for lenis */
  html.lenis,
  html.lenis body {
    height: auto;
  }

  .lenis:not(.lenis-autoToggle).lenis-stopped {
    overflow: clip;
  }

  .lenis.lenis-smooth [data-lenis-prevent] {
    overscroll-behavior: contain;
  }

  .lenis.lenis-smooth iframe {
    pointer-events: none;
  }

  .lenis.lenis-autoToggle {
    transition-property: overflow;
    transition-duration: 1ms;
    transition-behavior: allow-discrete;
  }
  /* lenis */

</style>

<script setup>

  import 'lenis/dist/lenis.css'
  import Lenis from 'lenis'
  import gsap from 'gsap'
  import {ScrollTrigger} from 'gsap/ScrollTrigger'

  const props = defineProps(['text', 'small'])


  onMounted(()=>{
    gsap.registerPlugin(ScrollTrigger)
  //   const scroller = document.querySelector('.scroller')
  //   console.log(scroller)

  //   const secondItem = scroller.childNodes[1]

  //   const lastItem = scroller.childNodes[4]

  //   const middleItem = scroller.childNodes[2]
  //   console.log(middleItem)
  //   middleItem.classList.add('shrink')

  //   const scaleup = scroller.childNodes[3]
  //   secondItem.classList.add('shrink2')
  //   scaleup.classList.add('scale-up')

  //   const scrollerContent = Array.from(scroller.children)

  //   scrollerContent.forEach(item =>{
  //     const duplicatedItem = item.cloneNode(true)
  //     duplicatedItem.setAttribute('aria-hidden', true)
  //     console.log(duplicatedItem)
  //     scroller.appendChild(duplicatedItem)

  const spacer = document.querySelector('.holder')
  const scroller = document.querySelector('.scroller')
  const scrollerContent = Array.from(scroller.children)
  const container = gsap.utils.toArray('.toslide') 
  console.log(container)
  console.log(scroller.getBoundingClientRect().width)
    let tl = gsap.timeline({
      scrollTrigger:{
        trigger: spacer,
        pin: true,
        end:`+=${scroller.getBoundingClientRect().width}`,
        scrub:true
      }

    })

    tl.to(container,  {
      x: -400 *(container.length -1),
    })
  })



  
</script>
