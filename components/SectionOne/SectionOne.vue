<template>
  <section class="bg-[url(../../assets/effect.png)] text-textprimary font-orbitron flex flex-col gap-4 lg:gap-11 pt-[30px] items-center overflow-hidden holder lg:mb-80">
    <h1 class="font-bold text-[24px] text-center  text-white px-13 w-full lg:text-big md:px-36">{{ text }}</h1>

    <p class="text-[12px] text-white text-center px-4 lg:px-28 md:text-small md:font-medium">{{small}}</p>
    <button @click ="handleClick" class="cursor-pointer bg-gold text-cod w-fit p-5 flex items-center md:w-49 md:h-[50px] rounded-[6.53px] h-[32.6px] font-extrabold btn">
      Join the waitlist
    </button>
    <div class="flex gap-[6.39px] mt-[38.41px] items-start pb-1 overflow-x-hidden lg:mb-60 h-[20vh] lg:h-fit w-full">
      
      <div class="scroller w-fit flex gap-5 items-center justify-center left-0">
        <div
    class="carousel"
    @mouseenter="pauseRotation"
    @mouseleave="startRotation"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div
      v-for="(poster, index) in visiblePosters"
      :key="poster.id"
      :class="['poster', positionClasses[index]]"
    >
      <img :src="poster.image" alt="" />
    </div>
  </div>
      </div>
    </div>
  </section>

</template>

<style scoped>  
/* for lenis */
  html.lenis,
  html.lenis body {
    height: auto;
  }

  .lenis:not(.lenis-autoToggle).lenis-stopped {
    overflow: clip;
  }

  .lenis.lenis-smooth [data-lenis-prevent] {
    overscroll-behavior: contain;
  }

  .lenis.lenis-smooth iframe {
    pointer-events: none;
  }

  .lenis.lenis-autoToggle {
    transition-property: overflow;
    transition-duration: 1ms;
    transition-behavior: allow-discrete;
  }
  /* lenis */

  .firstItem{
    height:310px ;
    width:285px ;
  }

  .secondItem{
    height:390px ;
    width:360px ;
  }
  .middleItem{
    height:512px;
    width: 471px;
  }

  .carousel {
  display: flex;
  width: 100vw;
  justify-content: center;
  align-items: center;
  gap: 20px;
  transition: all 0.5s ease;
  touch-action: pan-y;
  user-select: none;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  transform: translateY(50%) ;

}

.poster {
  transition: transform 0.5s ease, width 0.5s ease, opacity 0.5s ease;
  overflow: hidden;
}

.poster img {
  width: 100%;
  display: block;
  border-radius: 10px;
}

.pos-1 {
  width: 285px;
  height: 310px;
  transform: scale(0.8);
  opacity: 0.5;
  z-index: 1;
}
.pos-2 {
  width: 360px;
  height: 390px;
  transform: scale(0.9);
  opacity: 0.7;
  z-index: 2;
}
.pos-3 {
  width: 471px;
  height: 512px;
  transform: scale(1);
  opacity: 1;
  z-index: 3;
}
.pos-4 {
  width: 360px;
  height: 390px;
  transform: scale(0.9);
  opacity: 0.7;
  z-index: 2;
}
.pos-5 {
  width: 285px;
  height: 310px;
  transform: scale(0.8);
  opacity: 0.5;
  z-index: 1;
}

@media screen and (max-width: 1000px) {
  .poster img {
  width: 100%;
  display: block;
  border-radius: 10px;
}



.pos-1 {
  min-width: 150px;
  height:100%;
  min-height: 125px;
  transform: scale(0.8);
  opacity: 0.5;
  z-index: 1;
}
.pos-2 {
  min-width: 115px;
  height:100%;
  min-height: 125px;
  transform: scale(0.9);
  opacity: 0.7;
  z-index: 2;
}
.pos-3 {
  min-width: 150px;
  height:100%;
  min-height: 165px;
  transform: scale(1);
  opacity: 1;
  z-index: 3;
}
.pos-4 {
  min-width: 150px;
  height: 100%;
  min-height: 125px;
  transform: scale(0.9);
  opacity: 0.7;
  z-index: 2;
}
.pos-5 {
  min-width: 150px;
  height:100%;
  min-height: 125px;
  transform: scale(0.8);
  opacity: 0.5;
  z-index: 1;
}
}

@media screen and (max-width: 800px) {
  .carousel {
  display: flex;
  width: 100vw;
  justify-content: center;
  align-items: center;
  gap: 20px;
  transition: all 0.5s ease;
  touch-action: pan-y;
  user-select: none;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  transform: translateY(90%) ;
}
}
</style>

<script setup>
  import { openModal } from '../composables/states'
  import 'lenis/dist/lenis.css'

  import p1 from '../../assets/display2.png'
  import p2 from '../../assets/display1.png'
  import p3 from '../../assets/display3.png'
  import p4 from '../../assets/display2.png'
  import p5 from '../../assets/display1.png'

  const modal = openModal()

  const handleClick =()=>{
    modal.value = !modal.value
  }
  const props = defineProps(['text', 'small'])


  const posters = ref([
  { id: 1, image: p1},
  { id: 2, image: p2 },
  { id: 3, image: p3 },
  { id: 4, image: p4 },
  { id: 5, image: p5 },
]);

const positionClasses = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];
const visiblePosters = computed(() => posters.value.slice(0, 5));

let intervalId = null;

const startRotation = () => {
  stopRotation();
  intervalId = setInterval(() => {
    rotateForward();
  }, 3000);
};

const stopRotation = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const rotateForward = () => {
  posters.value.push(posters.value.shift());
};

const rotateBackward = () => {
  posters.value.unshift(posters.value.pop());
};

onMounted(() => {
  startRotation();
});

onBeforeUnmount(() => {
  stopRotation();
});

// Swipe Support
const touchStartX = ref(0);

const onTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].clientX;
};

const onTouchEnd = (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX.value;
  if (Math.abs(deltaX) > 30) {
    deltaX > 0 ? rotateBackward() : rotateForward();
  }
};



  
</script>
