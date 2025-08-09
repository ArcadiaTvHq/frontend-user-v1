<template>
    
  <div class="text-white w-full justify-center">
    <p class="text-normal">Profile Info</p>
    <div class="flex gap-13 mt-6 items-end">
      <div class="w-1/2 flex flex-col gap-2">
        <label>Display Name</label>
        <input class="w-full bg-cardgray h-13 border-minputb rounded-[8px] px-4" placeholder="*****" :disabled="true" />
      </div>
      <div class="w-1/2 flex flex-col gap-2">
        <span><label>Password</label><button class="ml-5 text-gold" @click="modal.toggleChange">change </button></span>
        <input class="w-full bg-cardgray h-13 border-minputb rounded-[8px] px-4" placeholder="*****" :dis />
      </div>
    </div>
    <p class="text-normal mt-16">Subscription info</p>
    <div class="display flex mt-8 justify-between gap-2 flex-col lg:flex-row items-center">
      <Card
        type="Free"
        :logo="free"
        price="₦0"
        priceStyling="text-[24px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-[24px] font-inter"
        button="hidden"
        class="slide-left w-full max-w-full  border-gold border-1"
        :benefits="freeBenefits"
        typeclass="text-type font-medium md:text-[21px]"
      />
      <Card
        type="standard"
        :logo="free"
        price="₦500"
        priceStyling="text-[24px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-[24px] text-white font-inter"
        button="hidden"
        class="w-full max-w-full"
        :benefits="standardBenefits"
        typeclass="text-type font-medium md:text-[21px] text-white"
      />
      <Card
        type="Premium"
        :logo="premium"
        price="₦1000"
        priceStyling="text-[24px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-[24px] text-white font-inter"
        button="hidden"
        class="slide-right w-full max-w-full"
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
import { useModal } from "#imports";

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

  const modal = useModal()
  const change =  computed(()=> modal.isChange)

  

  

</script>
