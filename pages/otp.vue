<template>
  <section class=" bg-body bg-[url(../../assets/signup/bg.png)] bg-cover h-[100vh] w-[100vw] text-white flex md:items-center justify-center bg-blend-overlay items-end">
      <form class="bg-body w-full md:w-1/2 h-fit md:h-7/10 flex flex-col gap-6 rounded-[18px] border-inputb border-1 px-10 md:px-26 pt-11 pb-7 justify-center items-center">
        <img src="../assets/logo2.png" class="mb-[16px] ">
        <h1 class="font-orbitron md:text-normal text-center">Verify your mail</h1>
        <p class="font-inter text-type text-[#665E59]">Enter the code sent to your mail</p>
    
        <div class="flex gap-3">
          <input class="w-[50px] h-[50px] rounded-[6px] hover:scale-[1.1] border-[1px] border-gold  text-black flex px-5" type="text" maxlength="1"/>
          <input class="w-[50px] h-[50px] rounded-[6px] hover:scale-[1.1] border-[1px] border-gold text-black px-5" type="text" maxlength="1"/>
          <input class="w-[50px] h-[50px] rounded-[6px] hover:scale-[1.1] border-[1px] border-gold text-black px-5" maxlength="1"/>
          <input class="w-[50px] h-[50px] rounded-[6px] hover:scale-[1.1] border-[1px] border-gold text-black px-5" maxlength="1"/>
          <input class="w-[50px] h-[50px] rounded-[6px] hover:scale-[1.1] border-[1px] border-gold text-black px-5" maxlength="1"/>
        </div>
        <div>
          <a class="font-inter text-smallest text-[#4A4F4A] cursor-pointer">Didn't receive code?</a>
          <p class="font-inter text-center text-smallest">Click to resend</p>
        </div>
          
        <div class="flex md:flex-row md:justify-between w-full max-w-[520px] items-center flex-col-reverse">
          <button class="flex justify-center items-center gap-1 mt-2 md:mt-0 cursor-pointer " type="button">
            <img class="size-4 move-left" src="../assets/Icon.png" >
            <p class="font-orbitron">Back</p>
          </button>
          <button class="h-13 w-52 max-w-50 bg-gold text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer">Continue</button>
        </div>
      </form>
    </section> 
  </template>
  
  <style scoped>
   input{
    background-color: #fff;
   }
  
  </style>

<script setup>
  import gsap from 'gsap'

  onMounted(()=>{
    const moveLeft = document.querySelector('.move-left')

    const tl =gsap.timeline({
      repeat: -1,
      repeatDelay:1,
      duration:0.5,
    })
    tl.fromTo(moveLeft, 
    {
      x: 0,
    }, {
      x: -10,
    })
  })
</script>