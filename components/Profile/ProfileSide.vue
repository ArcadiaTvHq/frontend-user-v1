<template>
  <div class="bg-cardgray max-w-[444px] rounded-[15px] flex justify-center flex-col items-center font-orbitron card lg:h-[600px]">
    <div class="w-4/5 h-full flex flex-col justify-center items-center">
      <div class="text-white flex justify-center items-center flex-col ">
        <img src="../../assets/images/avatar.png" class="rounded-full h-[130px] w-[130px]">
        <p class="text-normal">{{firstName}} {{ lastName }}</p>
        <p>{{email}}</p>
        <button class="mt-11 bg-gold w-55 px-13 h-16 text-black rounded-[12px] mb-8">
          <p class="font-semibold">{{ subscription === null ? "Free" : subscription }}</p>
          <p>{{ subscription === null ? "Upgrade Plan" : "Expires"}}</p>
        </button>

      </div>
      
    </div>
    <div class="mt-auto flex w-4/5 justify-start text-white gap-4 items-center mb-8 ">
        <LazyIconsLogouticon/>
        <p>Logout</p>
      </div>
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  .card {
    height: fit-content;
    width: 100%;
    max-width: 600px;
    padding: 5px;
  }
}
</style>

<script setup>


  const props = defineProps({
    firstName : {type: String},
    lastName : String,
    email: {type:String},
    profileimg: String,
    plan: String,
    subscription: String,

  })

  

</script>