<template>
  <section class=" bg-body text-textprimary  px-8 md:flex md:flex-col lg:flex-row md:items-center justify-center font-mont lg:gap-33 ">
    <div class="flex flex-1 flex-col md:max-w-[600px]">
      <h1 class="font-bold text-normal text-center md:text-[44px] max-w-[513px] md:text-left">Frequently Asked 
      <span class="text-gold">Questions & Answers </span></h1>
      <p class="hidden lg:block text-normal font-medium w-[517px]">Vestibulum sit amet tortor sit amet libero lobortis semper at et odio. </p>
    <img class=" hidden lg:block w-110 h-103 animation"  src="../../assets/Decoration.png">
    </div>
    <div class="flex flex-col gap-4 mt-9">
      <div class="bg-darkgray rounded-[8px] md:max-w-[624px]">
    <button @click="handleToggle" class="bg-darkgold w-full h-13 flex items-center justify-between rounded-[8px] px-5 md:px-10 md:py-8 cursor-pointer btn"><p class="text-left text-smallest md:text-normal">Pellentesque ac bibendum tortor?</p> <img class="w-3 h-2 icon" src="../../assets/chevron.png"></button>
    <div v-if="usetoggle" class="px-5 py-3 md:px-10 md:py-6 ">
      <p class="text-smallest  md:text-normal">Vivamus sit amet interdum elit. Proin lacinia erat ac velit tempus auctor.</p>
    </div>
  </div>
  <div class="bg-darkgray rounded-[8px] md:max-w-[624px]">
    <button @click="handleToggleMid" class="bg-darkgold w-full h-13 flex items-center justify-between rounded-[8px] px-5 md:px-10 md:py-8 cursor-pointer btn"><p class="text-left text-smallest md:text-normal">Pellentesque ac bibendum tortor?</p> <img class="w-3 h-2 icon2" src="../../assets/chevron.png"></button>
    <div v-if="usetogglemid" class="px-5 py-3 md:px-10 md:py-6 ">
      <p class="text-smallest  md:text-normal">Vivamus sit amet interdum elit. Proin lacinia erat ac velit tempus auctor.</p>
    </div>
  </div>
  <div class="bg-darkgray rounded-[8px] md:max-w-[624px]">
    <button @click="handleToggleLast" class="bg-darkgold w-full h-13 flex items-center justify-between rounded-[8px] px-5 md:px-10 md:py-8 cursor-pointer btn"><p class="text-left text-smallest md:text-normal">Pellentesque ac bibendum tortor?</p> <img class="w-3 h-2 icon3" src="../../assets/chevron.png"></button>
    <div v-if="usetogglelast" class="px-5 py-3 md:px-10 md:py-6 ">
      <p class="text-smallest  md:text-normal">Vivamus sit amet interdum elit. Proin lacinia erat ac velit tempus auctor.</p>
    </div>
  </div>
    </div>
  </section>
</template>

<style scoped>
  .animation:hover{
    animation: scale-up linear 0.2s forwards
  }

  @keyframes scale-up {
    from{
      transform: scale(1);
    }
    to{
      transform: scale(1.3);
    }
  }

  .rotate{
    animation: rotate 0.5s linear forwards;
  }
  @keyframes rotate {
    to{
      transform: rotate(-180deg);
    }
  }

  .rotate-reverse{
    animation: rotate-reverse 0.5s reverse backwards;
  }
  @keyframes rotate-reverse {
    to{
      transform: rotate(-180deg);
    }
  }
</style>

<script setup lang="ts">
  import { toggleFaq, toggleFaq2, toggleFaq3 } from '../composables/states'
  const usetoggle = toggleFaq()
  const usetogglemid = toggleFaq2()
  const usetogglelast = toggleFaq3()
  function handleToggle() {
    usetoggle.value = !usetoggle.value
    if(usetoggle.value == true){
      const icon = document.querySelector('.icon')
      icon.classList.add('rotate')
      icon.classList.remove('rotate-reverse')
    }
    if(usetoggle.value == false){
      const icon = document.querySelector('.rotate')
      icon.classList.remove('rotate')
      icon.classList.add('rotate-reverse')
    }

  }

  function handleToggleMid(){
    usetogglemid.value = !usetogglemid.value

    if(usetogglemid.value == true){
      const iconTwo = document.querySelector('.icon2')
      iconTwo.classList.add('rotate')
      iconTwo.classList.remove('rotate-reverse')
    }
    if(usetogglemid.value == false){
      const iconTwo = document.querySelector('.rotate')
      iconTwo.classList.remove('rotate')
      iconTwo.classList.add('rotate-reverse')
    }
  }

  function handleToggleLast(){
    usetogglelast.value = !usetogglelast.value

    if(usetogglelast.value == true){
      const iconThree = document.querySelector('.icon3')
      iconThree.classList.add('rotate')
      iconThree.classList.remove('rotate-reverse')
    }
    if(usetogglelast.value == false){
      const iconThree = document.querySelector('.rotate')
      iconThree.classList.remove('rotate')
      iconThree.classList.add('rotate-reverse')
    }
  }

  

</script>





