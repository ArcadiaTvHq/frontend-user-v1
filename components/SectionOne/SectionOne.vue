<template>
  <section
    class="relative overflow-hidden bg-black text-white font-orbitron flex flex-col items-center pt-8 pb-2 md:pt-12 md:pb-4 px-4 md:px-0"
  >
    <!-- Background images -->
    <img
      v-for="(poster, index) in props.posters"
      :key="`bg-${poster.id}`"
      :src="
        getHoverImageUrl(poster) ||
        getPrimaryImageUrl(poster) ||
        '/assets/standard.png'
      "
      :alt="`Background for ${poster.title}`"
      class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-2000"
      :class="{ 'opacity-100': index === centerPosterIndex }"
      @error="handleImageError"
    />

    <!-- Overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/30"
    ></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center gap-2 lg:gap-4">
      <h1
        class="font-orbitron font-bold text-[20px] md:text-[24px] lg:text-big text-center px-4 md:px-13 lg:px-36 w-full max-w-[1200px]"
      >
        {{ text }}
      </h1>
      <p
        class="font-orbitron text-[12px] md:text-small lg:text-base text-center px-4 md:px-28 lg:px-36 max-w-[1000px]"
      >
        {{ small }}
      </p>
      <button
        @click="handleClick"
        class="font-orbitron cursor-pointer text-cod w-fit px-4 py-2 md:p-4 flex items-center justify-center md:w-49 md:h-[45px] rounded-[6.53px] h-[32.6px] font-extrabold btn text-center text-sm md:text-base"
      >
        {{ button }}
      </button>
    </div>

    <!-- Carousel -->
    <div class="relative z-10 w-full flex items-center justify-center py-4">
      <!-- <div v-if="loading" class="flex items-center justify-center p-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"
        ></div>
      </div>
      <div v-else-if="error" class="text-red-500 text-center p-4">
        {{ error }}
      </div> -->
      <div
        class="carousel"
        @mouseenter="pauseRotation"
        @mouseleave="startRotation"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <NuxtLink
          v-for="(poster, index) in visiblePosters"
          :key="poster.id"
          :to="`/watch/${poster.slug}`"
          :class="['poster', positionClasses[index]]"
          @mouseenter="pauseRotation"
          @mouseleave="resumeRotation"
        >
          <img
            :src="getPrimaryImageUrl(poster)"
            :alt="poster.title"
            class="w-full h-full object-cover rounded-[10px]"
            @error="handleImageError"
          />
          <!-- <div
            class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >

            <img
              :src="poster.image"
              :alt="poster.title"
              class=" object-cover rounded-[10px] h-full w-full"
            />
            <div
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 class="text-white text-sm font-bold mb-1">
                {{ poster.title }}
              </h3>
              <p class="text-white/80 text-xs line-clamp-2">
                {{ poster.description }}
              </p>
            </div>
          </div>
        </div>

            <h3 class="text-white text-sm font-bold mb-1">
              {{ poster.title }}
            </h3>
            <p class="text-white/80 text-xs line-clamp-2">
              {{ poster.description }}
            </p>
          </div> -->
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease;
  touch-action: pan-y;
  user-select: none;
  width: 100%;
  max-width: 1400px;
  gap: 16px;
  padding: 20px 24px;
}

.poster {
  position: relative;
  transition: all 0.5s ease;
  overflow: hidden;
  border-radius: 10px;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.poster:hover {
  transform: scale(1.05);
  z-index: 20;
  box-shadow: 0 4px 20px rgba(255, 208, 5, 0.2);
}

.poster:hover .poster-info {
  opacity: 1;
}

.poster img {
  max-height: 100%;
  width: auto;
  object-fit: cover;
}

/* Large screens (1280px+) */
@media screen and (min-width: 1280px) {
  .pos-1,
  .pos-5 {
    flex: 0.7;
    opacity: 0.6;
    transform: scale(0.85);
  }
  .pos-2,
  .pos-4 {
    flex: 0.9;
    opacity: 0.8;
    transform: scale(0.9);
  }
  .pos-3 {
    flex: 1;
    opacity: 1;
    transform: scale(1);
  }
}

/* Medium-large screens (1024px to 1279px) */
@media screen and (min-width: 1024px) and (max-width: 1279px) {
  .pos-1,
  .pos-5 {
    flex: 0.7;
    opacity: 0.6;
    transform: scale(0.85);
  }
  .pos-2,
  .pos-4 {
    flex: 0.9;
    opacity: 0.8;
    transform: scale(0.9);
  }
  .pos-3 {
    flex: 1;
    opacity: 1;
    transform: scale(1);
  }
}

/* Medium screens (768px to 1023px) */
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .pos-1,
  .pos-5 {
    flex: 0.7;
    opacity: 0.6;
    transform: scale(0.85);
  }
  .pos-2,
  .pos-4 {
    flex: 0.9;
    opacity: 0.8;
    transform: scale(0.9);
  }
  .pos-3 {
    flex: 1;
    opacity: 1;
    transform: scale(1);
  }
}

/* Small-medium screens (640px to 767px) */
@media screen and (min-width: 640px) and (max-width: 767px) {
  .pos-1,
  .pos-5 {
    display: none;
  }
  .pos-2,
  .pos-4 {
    flex: 0.9;
    opacity: 0.8;
    transform: scale(0.9);
  }
  .pos-3 {
    flex: 1;
    opacity: 1;
    transform: scale(1);
  }
  .poster:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 10px rgba(255, 208, 5, 0.15);
  }
}

/* Small screens (up to 639px) */
@media screen and (max-width: 639px) {
  .pos-1,
  .pos-5 {
    display: none;
  }
  .pos-2,
  .pos-4 {
    flex: 0.9;
    opacity: 0.8;
    transform: scale(0.9);
  }
  .pos-3 {
    flex: 1;
    opacity: 1;
    transform: scale(1);
  }
  .poster:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 10px rgba(255, 208, 5, 0.15);
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useModal } from "#imports";
import { useRouter } from "vue-router";
import { useBlobImages } from "~/composables/useBlobImages";

const props = defineProps({
  text: { type: String, required: true },
  small: { type: String, required: true },
  button: { type: String, required: true },
  posters: { type: Array, required: true },
});

const router = useRouter();
const modal = useModal();
const { getPrimaryImageUrl, getHoverImageUrl } = useBlobImages();

const handleClick = () => {
  if (props.button === "Join the waitlist") {
    modal.toggleWaitlist();
  } else {
    navigateTo("/login");
  }
};

const positionClasses = ["pos-1", "pos-2", "pos-3", "pos-4", "pos-5"];

let visiblePosters = computed(() => props.posters.slice(0, 5));
// Visible posters updated
// Use reactive currentIndex for visiblePosters to enable rotation
const currentIndex = ref(0);

visiblePosters = computed(() => {
  const posters = props.posters;
  if (!posters || posters.length === 0) return [];

  // Create a window of 5 posters centered around currentIndex
  const startIndex = currentIndex.value;
  const result = [];

  for (let i = 0; i < 5; i++) {
    const index = (startIndex + i) % posters.length;
    result.push(posters[index]);
  }

  return result;
});

//  let intervalId = null;

// Compute the actual poster index that should be in the center
const centerPosterIndex = computed(() => {
  const posters = props.posters;
  if (!posters || posters.length === 0) return 0;

  // The center poster is at currentIndex + 2 (since we show 5 posters, center is at index 2)
  return (currentIndex.value + 2) % posters.length;
});

// Simple carousel rotation with internal state
let intervalId = null;
const isRotationPaused = ref(false);

const startRotation = () => {
  if (isRotationPaused.value) return;
  stopRotation();
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.posters.length;
  }, 6000);
};

const pauseRotation = () => {
  isRotationPaused.value = true;
  stopRotation();
};

const resumeRotation = () => {
  isRotationPaused.value = false;
  startRotation();
};

const stopRotation = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const rotateForward = () => {
  currentIndex.value = (currentIndex.value + 1) % props.posters.length;
};

const rotateBackward = () => {
  currentIndex.value =
    (currentIndex.value - 1 + props.posters.length) % props.posters.length;
};

// Touch support
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

const handleImageError = (event) => {
  // Fallback to default image if primary image fails
  event.target.src = "/assets/standard.png";
};

onMounted(() => {
  resumeRotation();
});

onBeforeUnmount(() => {
  stopRotation();
});
</script>
