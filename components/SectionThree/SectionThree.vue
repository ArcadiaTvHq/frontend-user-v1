<template>
  <section class="text-textprimary font-orbitron flex flex-col items-center mt-16 overflow-x-hidden trigger">
    <h1 class="text-normal mb-[6px] md:text-medium">Arcadia Membership</h1>
    <p class="text-smallest text-center font-inter md:text-small">Choose the perfect subscription plan for your streaming needs</p>
    <div class="flex  lg:flex-row flex-col items-center justify-center gap-9 w-full lg:w-full ">
      <Card type="Free"  :logo=free price="₦0" priceStyling="text-normal font-semibold mb-[13px] md:text-smedium" button=" border-[0.85px] h-13 full md:w-full h-17 rounded-[8.51px] mb-[18px] cursor-pointer cardbtn" class="slide-left lg:max-w-[500px] w-4/5 flex-1" 
      l3 = 'No pause ads'
      l2="No playtime ads"
      l4="International Content"
      l1="4k HD streaming content"
      :checked=cross
      :cross=cross
      />
      <Card type="standard"   :logo=standard price="₦500" priceStyling="text-normal font-semibold mb-[13px] md:text-smedium" button=" border-[0.85px] h-13 w-full md:w-full h-17 rounded-[8.51px] mb-[18px] cursor-pointer cardbtn" 
      l3 ='No pause ads'
      l2="No playtime ads"
      l4="International Content"
      l1="4k HD streaming content" class="lg:max-w-[500px] w-4/5  flex-1"
      :checked=checked
      :cross=cross
      />
      <Card type="Premium" :logo=premium  price="₦1000" priceStyling="text-normal font-semibold mb-[13px] md:text-smedium text-gold" button=" h-13 w-full md:w-full h-17 rounded-[8.51px] mb-[18px] cursor-pointer bg-gold cardbtngold" class="slide-right lg:max-w-[500px] w-4/5 flex-1 "
      l3 = 'No pause ads'
      l2="No playtime ads"
      l4="International Content"
      l1="4k HD streaming content"
      :checked=checked
      :cross=cross
      />
    </div>

    <p class="text-center text-smallest mt-11 md:mt-14 font-inter ">Get a 7-day free trial on any plan! Cancel anytime during the trial period with no charges.</p>
    <p class="text-center text-smallest mb-15 md:mb-50 font-inter">Get ready for an incredible movie streaming journey with PlayCine. <a class="underline text-gold cursor-pointer">Sign up </a>today and let the entertainment begin! </p>
  </section>
</template>

<script setup>
  import cross from "@/assets/cross.png" 
  import checked from '@/assets/Vector.png'
  import free from '../../assets/award.png'
  import premium from '../../assets/king.png'
  import standard from '../../assets/standard.png'
  import gsap from 'gsap'
  import {ScrollTrigger} from 'gsap/ScrollTrigger'

  onMounted(()=>{
    gsap.registerPlugin(ScrollTrigger)
    const trigger = document.querySelector(".trigger")
    const slideLeft = document.querySelector(".slide-left")
    const slideRight = document.querySelector(".slide-right")

    const tl = gsap.timeline({
      scrollTrigger:{
        trigger: trigger,
        start: 'top bottom',
        end: 'bottom 90%',
      },
      duration: 2

    })
    tl.fromTo(slideLeft, {
      xPercent: 90,
      scale: 0.8
    },
  {
    xPercent: 0,
      scale: 1
  })

  tl.fromTo(slideRight, {
      xPercent: -90,
      scale: 0.8
    },
  {
    xPercent: 0,
      scale: 1
  }, '<')


  })
</script>

<style>
  .cardbtn:hover{
    animation: cardbtnhover 0.5s linear forwards;
  }
  @keyframes cardbtnhover{
    to{
      transform: scale(1.05);
      color: #000;
      background-color: white;
    }
  }
  .cardbtngold:hover{
    animation: cardbtnhovergold 0.5s linear forwards;
  }

  @keyframes cardbtnhovergold{
    to{
      transform: scale(1.05);
      background-color: var(--color-hover);
    }
  }
</style>