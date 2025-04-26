<template>
  <div class="bg-darkgray rounded-[8px] md:max-w-[624px]">
    <button @click="handleToggle" class="bg-darkgold w-full h-13 flex items-center justify-between rounded-[8px] px-5 md:px-10 md:py-8 cursor-pointer"><p class="text-left text-smallest md:text-normal">Pellentesque ac bibendum tortor?</p> <img class="w-3 h-2 icon" src="../../assets/chevron.png"></button>
    <div v-if="toggle" class="px-5 py-3 md:px-10 md:py-6 ">
      <p class="text-smallest  md:text-normal">Vivamus sit amet interdum elit. Proin lacinia erat ac velit tempus auctor.</p>
    </div>
  </div>
</template>
<style scoped>
  .rotate{
    animation: rotate 1s linear forwards;
  }
  @keyframes rotate {
    to{
      transform: rotate(-180deg);
    }
  }

  .rotate-reverse{
    animation: rotate 1s reverse backwards;
  }
</style>

<script setup>
  const toggle = ref(false)
  function handleToggle() { 
    console.log('ok')
    toggle.value = !toggle.value
    console.log(toggle)
    if(toggle.value == true){
      const icon = document.querySelector('.icon')
      icon.classList.add('rotate')
      icon.classList.remove('rotate-reverse')
    }
    if(toggle.value == false){
      const icon = document.querySelector('.rotate')
      icon.classList.remove('rotate')
      icon.classList.add('rotate-reverse')
    }
    
    
  }

</script>