<template>
  <section class=" bg-body text-textprimary  px-8 md:flex md:flex-col lg:flex-row md:items-center justify-center font-mont lg:gap-33 ">
    <div class="flex flex-1 flex-col md:max-w-[600px]">
      <h1 class="font-bold text-normal text-center md:text-[44px] max-w-[513px] md:text-left animation">Frequently Asked 
      <span class="text-gold">Questions & Answers </span></h1>
      <p class="hidden lg:block text-normal font-medium w-[517px]">Vestibulum sit amet tortor sit amet libero lobortis semper at et odio. </p>
    <img class=" hidden lg:block w-110 h-103 animation"  src="../../assets/Decoration.png">
    </div>
    <div class="flex flex-col gap-4 mt-9">
      <Toogle />
      <Toogle />
      <Toogle />
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
</style>



