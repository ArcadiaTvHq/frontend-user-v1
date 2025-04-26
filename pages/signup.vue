<template>
  <section class=" bg-[url(../../assets/signup/bg.png)] bg-cover h-[100vh] w-[100vw] text-white flex items-center justify-center bg-body bg-blend-overlay">
    <form class="bg-body md:w-1/2 h-9/10 flex flex-col gap-5 rounded-[18px] border-inputb border-1 px-40 pt-21 pb-16 justify-center items-center backdrop">
      <div class=" flex justify-center">
        <img class="max-w-[60px]max-h-[60px]" src="@/assets/logo2.png">
      </div> 
      <h1 class="font-orbitron md:text-normal text-center">Sign up to a new account</h1>
      <div class='flex font-orbitron mx-auto gap-4 w-full'>
        <div class="gap-1 flex flex-col w-full">
          <label class="block">First Name</label>
          <input class="w-full h-13 border-1 border-inputb rounded-[8px] p-4 font-inter" placeholder="David " type="text" required/>
        </div>
        <div class="gap-1 flex flex-col w-full">
          <label class="block">Last Name</label>
          <input class="w-full h-13 border-1 border-inputb rounded-[8px]  p-4 font-inter" placeholder="Adewale" type="text" required/>
        </div>
      </div>
      <div class="flex mx-auto flex-col font-orbitron gap-1 w-full">
        <label class="block">Email</label>
        <input class="w-full h-13 border-1 border-inputb rounded-[8px]  p-4 font-inter" placeholder="david.a@arcadiatv.com" required type="email"/>
      </div>
      <div class="flex mx-auto flex-col font-orbitron gap-1 w-full">
        <label class="block">Create Password</label>
        <input class=" w-full h-13 border-1 border-inputb rounded-[8px]  p-4 font-inter" type="password" required/>
      </div>
      <div class="flex mx-auto flex-col font-orbitron gap-1 w-full ">
        <label class="block">Confirm Password</label>
        <input class="w-full h-13 border-1 border-inputb rounded-[8px]  p-4 font-inter" type="password" required/>
      </div>
      <div class="flex gap-4 justify-start items-center w-full">
        <input class="size-4 bg-[1E1E1E] border-1 border-inputb" type="checkbox"/>
        <p class="font-inter text-type">Keep me signed in</p>
        
      </div>
      <p class="text-type font-inter">By clicking "Continue," you acknowledge that you have read and accept our Privacy Policy & Subscriber Agreement.</p>
      <button class="h-13 w-52 bg-gold text-black font-orbitron rounded-[8px] font-extrabold cursor-pointer">Continue</button>
    </form>
  </section>
</template>
