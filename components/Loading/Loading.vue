<template>
  <div class="flex fixed z-999"><div class="h-[100vh] w-[30vw] bg-gold slide-down "></div>
  <div class="h-[100vh] w-[40vw] bg-black flex items-center" >
    <img src="@/assets/arcadia.png">
  </div>
  <div class="h-[100vh] w-[30vw] bg-gold slide-up"></div></div>
</template>
<style scoped>
  .slide-down{
    animation: slide-down 5s  ease forwards;
  }
  .slide-up{
    animation: slide-up 5s ease forwards;
  }

  @keyframes slide-up{
    0%{
      transform: translate3d(0,0,0);
    }
    100%{
      transform: translate3d(0,-100%,0);
    }
  }

  @keyframes slide-down{
    0%{
      transform: translate3d(0,0,0);
    }
    100%{
      transform: translate3d(0,101%,0);
    }
  }
</style>