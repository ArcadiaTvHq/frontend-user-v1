<template>
<section class=" bg-body bg-[url(../../assets/signup/bg.png)] bg-cover h-[100vh] w-[100vw] text-white flex items-center justify-center bg-blend-overlay">
    <form class="bg-body w-1/2 h-7/10 flex flex-col gap-6 rounded-[18px] border-inputb border-1 px-26 pt-15 pb-7 justify-center items-center">
      <div class=" flex justify-center">
        <img class="max-w-[60px]max-h-[60px]" src="@/assets/logo2.png">
      </div> 
      <h1 class="font-orbitron md:text-normal text-center">Sign in to your account</h1>
  
      <div class="flex mx-auto flex-col font-orbitron gap-1 w-full">
        <label class="block">Email</label>
        <input class="w-full h-13 border-1 border-inputb rounded-[8px]  p-4 font-inter" placeholder="david.a@arcadiatv.com" required type="email"/>
      </div>
      <div class="flex mx-auto flex-col font-orbitron gap-1 w-full">
        <label class="block"> Password</label>
        <input class=" w-full h-13 border-1 border-inputb rounded-[8px]  p-4 font-inter" type="password" placeholder="........" required/>
      </div>
      <div class="flex flex-col">
        <button class="h-13 w-52 mt-[7px] bg-gold text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer">Login</button>
      <a class="text-center mt-3 font-orbitron">Forgot Password?</a>
      </div>
      <div class="flex gap-4 justify-start items-center w-full border-b-[1px] border-b-white pb-5 ">
        <input class="size-4 bg-[1E1E1E] border-1 border-inputb " type="checkbox"/>
        <p class="font-inter text-type">Keep me signed in</p>
        
      </div>
      <span class="font-inter">Don't have an account <a class="text-gold underline">Sign in</a></span>
    </form>
  </section> 
</template>

<style scoped>
 input{
  background-color: #1e1e1e;
  color:#fff
 }

</style>