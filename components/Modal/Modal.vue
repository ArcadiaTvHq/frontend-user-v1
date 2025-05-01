<template>
  <div @click="close" class="bg-body bg-[url('@/assets/signup/bg.png')] bg-blend-overlay bg-cover fixed h-[100vh] w-[100vw] z-5 flex justify-center items-center opacity-99" v-if="modal">

    <form class="w-full md:w-fit h-fit flex justify-center items-center flex-col text-white font-orbitron bg-cod gap-5 lg:px-40 rounded-[18px] border-inputb border-1 py-21 px-10">
      <img src="../../assets/logo2.png">
      <h1 class="text-normal">Join the waitlist</h1>
      <div class="flex gap-4 w-full md:flex-row flex-col">
        <div class="flex flex-col gap-1 w-1/2" >
          <label>First Name</label>
          <input placeholder="David">
        </div>
        <div class="flex flex-col gap-1 w-1/2" >
          <label>Last Name</label>
          <input placeholder="Adewale">
        </div>
      </div>
      <div class="flex flex-col gap-1 w-full" >
          <label>Email</label>
          <input placeholder="david.a@gmail.com">
      </div>
      <button class='bg-gold text-black w-full h-13 rounded-[8px] mt-4 font-bold btn'>Join the waitlist</button>
    </form>
  </div>
</template>

<style scoped>
  input{
    background-color: #1E1E1E;
    border: 1px solid var(--color-inputb);
    padding: 0 0 0 10px;
    height: 51px;
    border-radius: 8px;
  }
  label{
    font-size: var(--text-type);
  }

</style>

<script setup>
  import { openModal } from '../composables/states';
  const modal = openModal()
  const close =()=>{
    modal.value = !modal.value
  }
</script>
