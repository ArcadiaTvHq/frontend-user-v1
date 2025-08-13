<template>
  <div class="flex flex-col gap-5 text-white lg:px-[104px] mt-16 sm:mt-20 md:mt-28 px-4 sm:px-6 md:px-12">
    <h1 class="text-[31px]">Seasons</h1>
    <div>
      <div class="border-b border-1 border-gold w-full flex gap-3 ">
        <div v-for="i in 2" :key="i" class="h-18 w-21 flex items-center justify-center">
          Season {{ i }}
        </div>
      </div>
    </div>
    <div>
      <div>
        <div class="h-[420px] overflow-scroll overflow-x-hidden bg-[#1A1A1A] ">
          <div class="flex gap-2 h-25 items-center px-6 hover:bg-black "v-for="i in 10" :key="i">
            <img src="../../assets/images/epimg.png" alt=""/>
            <div >
              <p>Episode 1: The awakening</p>
              <p text-gold>45 mins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>