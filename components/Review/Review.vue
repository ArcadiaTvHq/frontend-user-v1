<template >

  <div class="bg-body fixed top-0 left-0 z-100 h-screen w-screen bg-[url(../../assets/signup/bg.png)] bg-cover bg-blend-overlay flex justify-center items-center font-orbitron" v-if="review">
    <div class="fixed z-105 opacity-75 h-screen w-screen "></div>
    <div class="absolute z-108 text-white max-w-200 w-3/5 bg-black  flex-col flex h-4/5 px-22 border-[#5B5B5B] border-1 rounded-[18px] py-15 gap-10">
      <h1 class="text-center font-bold text-[30px]">Rate this show</h1>
      <div>
        <div>
          
          <div class="flex gap-8 ">
            <div class="w-1/4 flex flex-col gap-1">
              <h1 class="text-[36px] ">0</h1>
              <div class="flex"><button v-for="  i in 5"><img src="../../assets/icons/star.svg"/></button>
              </div>
              <p>Rate out of 5</p>
            </div>
            <div  class="w-2/3 flex flex-col gap-3">
              <div v-for ="i in 5" class="flex w-full items-center gap-1">
                <div>{{ i }}</div>
                <div class="h-2  rounded-[4px] w-full bg-white">
                </div>
              </div>

            </div>
          </div>
        </div>
        
        
      </div>
      <div class="flex flex-wrap gap-4 justify-center">
        <div v-for="rate in rating" class="border-gold border-[1px] rounded-[15px] h-14 w-1/4 flex items-center justify-center" >
          <span class="flex gap-1"><img :src="rate.img"/> <span>{{ rate.rating }}</span> <span>- {{ rate.content }}</span></span>
        </div>
      </div>
    <input class="border-gold border-[1px] rounded-[8px] bg-none h-36 bg-[#0B0B0B] p-4 " type="text" placeholder="Drop a comment"/>
    <div class="flex justify-end gap-6">
      <button class="btn bg-[#0B0B0B] text-white border-gold border-[1px] w-32 h-11 rounded-[15px]">Cancel</button>
      <button class="btn bg-gold text-black border-gold border-[1px] w-32 h-11 rounded-[15px]">Submit</button>
    </div>
    </div>
  </div>
</template>

<script setup>
  import { useModal } from '#imports';
  import rage from '../../assets/icons/Rage.svg'
  import unamused from '../../assets/icons/Unamused.svg'
  import neutral from '../../assets/icons/Neutral-face.svg'
  import warm from '../../assets/icons/Warm-smile.svg'
  import heart from '../../assets/icons/Heart-eyes.svg'

  const modal = useModal()
  const review = computed(()=> modal.isReview)

  

  const rating = [{img: rage, rating: '1', content:'Terrible'},{img: unamused, rating: '2', content:'Bad'},{img: neutral, rating: '3', content:'Meh'},{img: warm , rating: '4', content:'Good'},{img: heart, rating: '5', content:'Excellent'}]
</script>