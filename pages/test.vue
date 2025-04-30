<template>
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
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import p1 from '@/assets/display2.png'
import p2 from '@/assets/display1.png'
import p3 from '@/assets/display3.png'
import p4 from '@/assets/display1.png'
import p5 from '@/assets/display2.png'

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
  }, 2000);
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

<style scoped>
.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  transition: all 0.5s ease;
  touch-action: pan-y;
  user-select: none;
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
  width: 100px;
  transform: scale(0.8);
  opacity: 0.5;
  z-index: 1;
}
.pos-2 {
  width: 140px;
  transform: scale(0.9);
  opacity: 0.7;
  z-index: 2;
}
.pos-3 {
  width: 200px;
  transform: scale(1);
  opacity: 1;
  z-index: 3;
}
.pos-4 {
  width: 140px;
  transform: scale(0.9);
  opacity: 0.7;
  z-index: 2;
}
.pos-5 {
  width: 100px;
  transform: scale(0.8);
  opacity: 0.5;
  z-index: 1;
}
</style>