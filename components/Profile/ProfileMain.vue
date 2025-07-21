<template>
  <div class="text-white">
    <p class="text-normal">Profile Info</p>
    <div class="flex gap-13 mt-6">
      <div class="w-1/2 flex flex-col gap-2">
        <label>Display Name</label>
        <input class="w-full bg-cardgray h-13 border-minputb rounded-[8px] px-4" placeholder="*****" />
      </div>
      <div class="w-1/2 flex flex-col gap-2">
        <span><label>Password</label><a class="ml-5 text-gold">change Password</a></span>
        <input class="w-full bg-cardgray h-13 border-minputb rounded-[8px] px-4" placeholder="*****" />
      </div>
    </div>
    <p class="text-normal mt-16">Subscription info</p>
    <div class="display flex mt-8 justify-between">
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
    <div class="mt-6"><p>Next payment due </p></div>
  </div>
</template>

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

</script>
