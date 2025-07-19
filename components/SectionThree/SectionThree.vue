<template>
  <section
    class="text-textprimary font-orbitron flex flex-col items-center mt-16 px-4 md:px-8 overflow-x-hidden trigger"
  >
    <h1 class="text-[24px] md:text-normal lg:text-medium mb-4">
      Arcadia Membership
    </h1>
    <p
      class="text-smallest md:text-small text-center font-inter max-w-[800px] mb-8"
    >
      Choose the perfect subscription plan for your streaming needs
    </p>
    <div
      class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[900px] place-items-center"
    >
      <Card
        type="Free"
        :logo="free"
        price="₦0"
        priceStyling="text-[20px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-smedium"
        button="border-[0.85px] border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-13 w-full md:h-17 rounded-[8.51px] mb-[18px] cursor-pointer transition-all duration-300"
        class="slide-left w-full"
        :benefits="freeBenefits"
        typeclass="text-type font-medium md:text-[21px]"
      />
      <Card
        type="standard"
        :logo="free"
        price="₦500"
        priceStyling="text-[20px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-smedium"
        button="border-[0.85px] text-gold border-[#FFD005]  hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-13 w-full md:h-17 rounded-[8.51px] mb-[18px] cursor-pointer transition-all duration-300"
        class="w-full"
        :benefits="standardBenefits"
        typeclass="text-type font-medium md:text-[21px] text-white"
      />
      <Card
        type="Premium"
        :logo="premium"
        price="₦1000"
        priceStyling="text-[20px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-smedium text-gold"
        button="h-13 w-full md:h-17 rounded-[8.51px] mb-[18px] cursor-pointer bg-[#FFD005] text-black hover:bg-[#CE8F00] transition-all duration-300"
        class="slide-right w-full"
        :benefits="premiumBenefits"
        typeclass="text-type font-medium md:text-[21px] text-gold"
      />
    </div>

    <p
      class="text-center text-smallest md:text-small mt-8 md:mt-11 lg:mt-14 font-inter max-w-[800px]"
    >
      Get a 7-day free trial on any plan! Cancel anytime during the trial period
      with no charges.
    </p>
    <p
      class="text-center text-smallest md:text-small mb-10 md:mb-15 lg:mb-50 font-inter max-w-[800px]"
    >
      Get ready for an incredible movie streaming journey with PlayCine.
      <a
        class="underline text-[#FFD005] cursor-pointer hover:text-[#CE8F00] transition-colors"
        >Sign up</a
      >
      today and let the entertainment begin!
    </p>
  </section>
</template>

<style>
.cardbtn {
  transition: all 0.3s ease;
}

.cardbtn:hover {
  transform: scale(1.05);
  color: #000;
  background-color: #ce8f00;
}

.cardbtngold {
  transition: all 0.3s ease;
}

.cardbtngold:hover {
  transform: scale(1.05);
  background-color: #ce8f00;
}

@media (max-width: 1024px) {
  .cardbtn:hover,
  .cardbtngold:hover {
    transform: scale(1.02);
  }
}
</style>

<script setup>
import cross from "@/assets/cross.png";
import checked from "@/assets/Vector.png";
import free from "../../assets/award.png";
import premium from "../../assets/king.png";
import standard from "../../assets/standard.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const freeBenefits = [
  { text: "4k HD streaming content", included: false },
  { text: "No playtime ads", included: false },
  { text: "No pause ads", included: false },
  { text: "International Content", included: false },
];

const standardBenefits = [
  { text: "4k HD streaming content", included: true },
  { text: "No playtime ads", included: true },
  { text: "No pause ads", included: false },
  { text: "International Content", included: false },
];

const premiumBenefits = [
  { text: "4k HD streaming content", included: true },
  { text: "No playtime ads", included: true },
  { text: "No pause ads", included: true },
  { text: "International Content", included: true },
];

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);
  const trigger = document.querySelector(".trigger");
  const slideLeft = document.querySelector(".slide-left");
  const slideRight = document.querySelector(".slide-right");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: "top bottom",
      end: "bottom 90%",
    },
    duration: 2,
  });

  tl.fromTo(
    slideLeft,
    {
      xPercent: 90,
      scale: 0.8,
      opacity: 0,
    },
    {
      xPercent: 0,
      scale: 1,
      opacity: 1,
    }
  );

  tl.fromTo(
    slideRight,
    {
      xPercent: -90,
      scale: 0.8,
      opacity: 0,
    },
    {
      xPercent: 0,
      scale: 1,
      opacity: 1,
    },
    "<"
  );
});
</script>