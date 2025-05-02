<template>
  <div class="bg-cardgray px-5 md:px-8 py-6 text-white rounded-[5px] mt-9 scale flex flex-col flex-1 shrink-5 max-w-[417px]">
    <div class="flex gap-2 mb-[6.77px]">
      <img class="size-5 md:size-8" :src= logo >
      <p class="text-type font-medium  md:text-[21px]">{{ type }}</p>
    </div>
    <h6 :class="priceStyling">{{price}}<span class="text-smallest">/month</span></h6>
    <button :class="button" >Select this plan</button>
    <List class="mb-[9px] md:mb-[16px]" :benefit=l1 :img=checked />
    <List class="mb-[9px] md:mb-[16px]" :benefit=l2 :img=checked />
    <List class="mb-[9px] md:mb-[16px]" :benefit=l3 :img=cross />
    <List class="mb-[9px] md:mb-[16px]" :benefit=l4 :img=cross />
  </div>
</template>

<style>
  .scale:hover{
    animation: scale 0.5s linear forwards
  }

  @keyframes scale {
    to{
      transform: scale(1.1);
    }
    
  }


</style>

<script setup >
  const props = defineProps(['type','price', 'logo', 'color', 'priceStyling', 'button', 'l1', 'l2', 'l3', 'l4', 'checked', 'cross'])
</script>
  
