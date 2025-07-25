<template>
  <section
    class="bg-cover bg-center bg-no-repeat text-textprimary font-orbitron flex flex-col items-center pt-8 pb-2 md:pt-12 md:pb-4 px-4 md:px-0"
    :style="
      centerBannerImage ? `background-image: url('${centerBannerImage}');` : ''
    "
  >
    <div class="flex flex-col items-center gap-2 lg:gap-4">
      <h1
        class="font-bold text-[20px] md:text-[24px] lg:text-big text-center text-white px-4 md:px-13 lg:px-36 w-full max-w-[1200px]"
      >
        {{ text }}
      </h1>

      <p
        class="text-[12px] md:text-small lg:text-base text-white text-center px-4 md:px-28 lg:px-36 max-w-[1000px]"
      >
        {{ small }}
      </p>
      <button
        @click="handleClick"
        class="cursor-pointer text-cod w-fit px-4 py-2 md:p-4 flex items-center justify-center md:w-49 md:h-[45px] rounded-[6.53px] h-[32.6px] font-extrabold btn text-center text-sm md:text-base"
      >
        {{ button }}
      </button>
    </div>
    <div class="w-full flex items-center justify-center py-4">
      <div class="w-full h-full flex items-center justify-center">
        <div v-if="loading" class="flex items-center justify-center p-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"
          ></div>
        </div>
        <div v-else-if="error" class="text-red-500 text-center p-4">
          {{ error }}
        </div>
        <div
          v-else
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
            @click="navigateToContent(poster.id)"
            @mouseenter="pauseRotation"
            @mouseleave="resumeRotation"
          >
            <img
              :src="poster.image"
              :alt="poster.title"
              class="w-full h-full object-cover rounded-[10px]"
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
  object-fit: contain;
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
import { openModal } from "../composables/states";
import { useRouter } from "vue-router";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  small: {
    type: String,
    required: true,
  },
  button: {
    type: String,
    required: true,
  },
  posters: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const modal = openModal();

const handleClick = () => {
  if (props.button === "Join the waitlist") {
    modal.value = true;
  } else {
    navigateTo("/login");
  }
};

const navigateToContent = (contentId) => {
  const poster = props.posters.find((p) => p.id === contentId);
  if (!poster?.slug) return;
  router.push({
    path: `/watch/${poster.slug}`,
  });
};

const positionClasses = ["pos-1", "pos-2", "pos-3", "pos-4", "pos-5"];
const visiblePosters = computed(() => props.posters.slice(0, 5));

const centerBannerImage = computed(() => {
  const centerPoster = visiblePosters.value[2];
  return centerPoster ? centerPoster.image : null;
});

let intervalId = null;

const isRotationPaused = ref(false);

const startRotation = () => {
  if (isRotationPaused.value) return;
  stopRotation();
  intervalId = setInterval(() => {
    rotateForward();
  }, 6000); // was 3000
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
  const newPosters = [...props.posters];
  newPosters.push(newPosters.shift());
  emit("update:posters", newPosters);
};

const rotateBackward = () => {
  const newPosters = [...props.posters];
  newPosters.unshift(newPosters.pop());
  emit("update:posters", newPosters);
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

onMounted(() => {
  resumeRotation();
});

onBeforeUnmount(() => {
  stopRotation();
});

const emit = defineEmits(["update:posters"]);
</script>
