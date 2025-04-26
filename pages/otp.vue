<template>
  <section class=" bg-body bg-[url(../../assets/signup/bg.png)] bg-cover h-[100vh] w-[100vw] text-white flex items-center justify-center bg-blend-overlay">
      <form class="bg-body w-1/2 h-7/10 flex flex-col gap-6 rounded-[18px] border-inputb border-1 px-26 pt-15 pb-7 justify-center items-center">
        
        <h1 class="font-orbitron md:text-normal text-center">Verify your mail</h1>
        <p>Enter the code sent to your mail</p>
    
        <div>
          <input class="w-[50px] h-[50px]"/>
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