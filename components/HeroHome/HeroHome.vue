<template>
  <section class="relative h-screen">
    <!-- Background with dynamic overlay -->
    <div class="absolute inset-0 bg-cover bg-center">
      <!-- All background images loaded, only active shown -->
      <div
        v-for="(content, index) in heroContent"
        :key="`bg-${content.id}`"
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        :style="{
          backgroundImage: `url(${
            content.bannerImage || '/assets/images/Picture.png'
          })`,
        }"
        :class="{
          'opacity-100': index === currentIndex,
          'opacity-0': index !== currentIndex,
        }"
      >
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
        ></div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD005]"
      ></div>
    </div>

    <!-- Main content -->
    <div
      class="relative h-full flex items-center translate-y-[15%] justify-center"
    >
      <!-- Side Movies - Desktop Only (Acting as Navigation) -->
      <div
        v-if="heroContent.length > 1"
        class="hidden lg:flex absolute left-[2%] xl:left-[5%] translate-y-[15%]"
      >
        <button
          @click="previousSlide"
          class="relative group cursor-pointer focus:outline-none side-image-hover animate-slide-left"
        >
          <!-- Previous Images - All loaded, only active shown -->
          <div class="relative w-36 h-48">
            <img
              v-for="(content, index) in heroContent"
              :key="`prev-${content.id}`"
              :src="content.posterImage || '/assets/images/preview.png'"
              :alt="`Previous: ${content.title}`"
              class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl opacity-0 transition-opacity duration-500"
              :class="{ 'opacity-70': index === getPreviousIndex() }"
            />
          </div>
          <div
            class="absolute inset-0 bg-black/30 group-hover:bg-black/50 rounded-lg transition-all"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            >
              <img
                src="../../assets/icons/chevron.svg"
                alt="Previous"
                class="w-4 h-4 rotate-90 text-white [&>path]:stroke-white"
              />
            </div>
          </div>
        </button>
      </div>

      <div
        v-if="heroContent.length > 1"
        class="hidden lg:flex absolute right-[2%] xl:right-[5%] translate-y-[15%]"
      >
        <button
          @click="nextSlide"
          class="relative group cursor-pointer focus:outline-none side-image-hover animate-slide-right"
        >
          <!-- Next Images - All loaded, only active shown -->
          <div class="relative w-36 h-48">
            <img
              v-for="(content, index) in heroContent"
              :key="`next-${content.id}`"
              :src="content.posterImage || '/assets/images/preview.png'"
              :alt="`Next: ${content.title}`"
              class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl opacity-0 transition-opacity duration-500"
              :class="{ 'opacity-70': index === getNextIndex() }"
            />
          </div>
          <div
            class="absolute inset-0 bg-black/30 group-hover:bg-black/50 rounded-lg transition-all"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            >
              <img
                src="../../assets/icons/chevron.svg"
                alt="Next"
                class="w-4 h-4 -rotate-90 text-white [&>path]:stroke-white"
              />
            </div>
          </div>
        </button>
      </div>

      <!-- Central Content -->
      <div
        class="flex flex-col items-center max-w-4xl w-full text-white text-center px-4 sm:px-6 md:px-8"
      >
        <!-- Mobile/Tablet Navigation Arrows -->
        <div
          v-if="heroContent.length > 1"
          class="flex lg:hidden justify-between w-full mb-6"
        >
          <button
            @click="previousSlide"
            class="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all flex items-center justify-center"
          >
            <div class="w-8 h-8 flex items-center justify-center">
              <img
                src="../../assets/icons/chevron.svg"
                alt="Previous"
                class="w-6 h-6 rotate-90 text-white [&>path]:stroke-white"
              />
            </div>
          </button>
          <button
            @click="nextSlide"
            class="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all flex items-center justify-center"
          >
            <div class="w-8 h-8 flex items-center justify-center">
              <img
                src="../../assets/icons/chevron.svg"
                alt="Next"
                class="w-6 h-6 -rotate-90 text-white [&>path]:stroke-white"
              />
            </div>
          </button>
        </div>

        <!-- Content Title with Animation -->
        <h1
          class="font-orbitron font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-3 md:mb-4 transition-all duration-700 ease-out"
          :key="currentHeroContent?.id"
          :class="{ 'animate-fade-in': currentHeroContent }"
        >
          {{ currentHeroContent?.title || "Loading..." }}
        </h1>

        <!-- Content Description with Animation -->
        <p
          class="font-orbitron text-sm md:text-base lg:text-lg max-w-xl mx-auto mb-6 md:mb-8 opacity-90 leading-relaxed transition-all duration-700 ease-out delay-100"
          :key="`desc-${currentHeroContent?.id}`"
          :class="{ 'animate-fade-in': currentHeroContent }"
        >
          {{ currentHeroContent?.description || "Loading description..." }}
        </p>

        <!-- Content Meta Info -->
        <div
          v-if="currentHeroContent"
          class="flex flex-wrap justify-center gap-4 mb-6 text-sm opacity-80"
        >
          <span
            v-if="
              currentHeroContent.type === 'series' &&
              currentHeroContent.seasonCount
            "
            class="flex items-center gap-1 capitalize"
          >
            <span class="w-2 h-2 bg-[#FFD005] rounded-full"></span>
            {{ currentHeroContent.seasonCount }} Season{{
              currentHeroContent.seasonCount > 1 ? "s" : ""
            }}
          </span>
          <span
            v-else-if="
              currentHeroContent.type === 'movie' && currentHeroContent.duration
            "
            class="flex items-center gap-1"
          >
            <span class="w-2 h-2 bg-[#FFD005] rounded-full"></span>
            {{ formatDuration(currentHeroContent.duration) }}
          </span>
          <span
            v-if="currentHeroContent.type"
            class="flex items-center gap-1 capitalize"
          >
            <span class="w-2 h-2 bg-[#FFD005] rounded-full"></span>
            {{ currentHeroContent.type }}
          </span>
          <span
            v-if="currentHeroContent.rating"
            class="flex items-center gap-1"
          >
            <span class="w-2 h-2 bg-[#FFD005] rounded-full"></span>
            ⭐ {{ currentHeroContent.rating }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="watchContent"
            class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 px-10 rounded-2xl flex items-center justify-center gap-3 font-medium btn-animate animate-scale-in delay-200"
          >
            <span>Watch</span>
            <img src="../../assets/icons/play.svg" alt="Play" class="w-5 h-5" />
          </button>
          <button
            @click="addToList"
            class="border-2 border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-12 px-10 rounded-2xl font-medium btn-animate animate-scale-in delay-300 flex items-center justify-center gap-3 group"
          >
            <span>Add to List</span>
            <img
              src="../../assets/icons/plus.svg"
              alt="add"
              class="w-5 h-5 group-hover:brightness-0"
            />
          </button>
        </div>

        <!-- Carousel Indicators -->
        <div v-if="heroContent.length > 1" class="flex gap-2 mt-8">
          <button
            v-for="(content, index) in heroContent"
            :key="content.id"
            @click="goToSlide(index)"
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="
              currentIndex === index
                ? 'bg-[#FFD005]'
                : 'bg-white/30 hover:bg-white/50'
            "
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";
import { useBlobImages } from "~/composables/useBlobImages";

// Props
const props = defineProps({
  autoPlay: {
    type: Boolean,
    default: true,
  },
  autoPlayInterval: {
    type: Number,
    default: 5000,
  },
});

// Emits
const emit = defineEmits(["watch", "addToList"]);

// Reactive state
const heroContent = ref([]);
const currentIndex = ref(0);
const loading = ref(true);
const autoPlayTimer = ref(null);

// Computed properties
const currentHeroContent = computed(() => {
  if (heroContent.value.length === 0) return null;
  return heroContent.value[currentIndex.value];
});

const previousContent = computed(() => {
  if (heroContent.value.length <= 1) return null;
  const prevIndex =
    currentIndex.value === 0
      ? heroContent.value.length - 1
      : currentIndex.value - 1;
  return heroContent.value[prevIndex];
});

const nextContent = computed(() => {
  if (heroContent.value.length <= 1) return null;
  const nextIndex =
    currentIndex.value === heroContent.value.length - 1
      ? 0
      : currentIndex.value + 1;
  return heroContent.value[nextIndex];
});

// Image URL builder
const IMAGE_DELIVERY_BASE_URL =
  "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

const buildImageUrl = (imageId) => {
  if (!imageId) return "/assets/images/preview.png";
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/public`;
};

// Methods
const fetchHeroContent = async () => {
  try {
    loading.value = true;
    const response = await ContentService.getFeaturedContent();

    // Transform the data to include image URLs
    heroContent.value = response.data.map((content) => {
      // Debug: Log series content structure
      if (content.type === "series") {
        console.log("Series content structure:", content);
        console.log("Available properties:", Object.keys(content));
        if (content.series) {
          console.log("Series object:", content.series);
        }
      }

      return {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        duration: content.duration_in_seconds,
        seasonCount:
          content.type === "series"
            ? content.season_count || content.seasons?.length || null
            : null,
        rating: content.interactions?.rating?.average || null,
        posterImage: buildImageUrl(
          content.poster_image_id || content.thumbnail_image_id
        ),
        bannerImage: buildImageUrl(
          content.banner_image_id || content.poster_image_id
        ),
        slug: content.slug,
        isPremium: content.is_premium,
        isFree: content.is_free,
      };
    });

    // Images will be loaded directly via URLs
  } catch (error) {
    console.error("Failed to fetch hero content:", error);
    // Fallback content
    heroContent.value = [
      {
        id: "fallback-1",
        title: "The Crown",
        description:
          "After the king's sudden death, Elizabeth's seemingly quiet life is rattled with personal trials and tribulations and the affairs of the state as she succeeds to the throne of the British monarchy.",
        type: "series",
        duration: 3600,
        seasonCount: 6,
        rating: 4.5,
        posterImage: "/assets/images/preview.png",
        bannerImage: "/assets/images/Picture.png",
        slug: "the-crown",
        isPremium: false,
        isFree: true,
      },
    ];
  } finally {
    loading.value = false;
  }
};

const nextSlide = () => {
  if (heroContent.value.length <= 1) return;
  currentIndex.value =
    currentIndex.value === heroContent.value.length - 1
      ? 0
      : currentIndex.value + 1;
  nextTick(() => {
    resetAutoPlay();
  });
};

const previousSlide = () => {
  if (heroContent.value.length <= 1) return;
  currentIndex.value =
    currentIndex.value === 0
      ? heroContent.value.length - 1
      : currentIndex.value - 1;
  nextTick(() => {
    resetAutoPlay();
  });
};

// Helper functions for side image indices
const getPreviousIndex = () => {
  if (heroContent.value.length <= 1) return 0;
  return currentIndex.value === 0
    ? heroContent.value.length - 1
    : currentIndex.value - 1;
};

const getNextIndex = () => {
  if (heroContent.value.length <= 1) return 0;
  return currentIndex.value === heroContent.value.length - 1
    ? 0
    : currentIndex.value + 1;
};

const goToSlide = (index) => {
  if (index >= 0 && index < heroContent.value.length) {
    currentIndex.value = index;
    resetAutoPlay();
  }
};

const resetAutoPlay = () => {
  if (props.autoPlay && props.autoPlayInterval > 0) {
    if (autoPlayTimer.value) {
      clearInterval(autoPlayTimer.value);
    }
    autoPlayTimer.value = setInterval(nextSlide, props.autoPlayInterval);
  }
};

const startAutoPlay = () => {
  if (
    props.autoPlay &&
    props.autoPlayInterval > 0 &&
    heroContent.value.length > 1
  ) {
    autoPlayTimer.value = setInterval(nextSlide, props.autoPlayInterval);
  }
};

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const watchContent = () => {
  if (currentHeroContent.value) {
    emit("watch", currentHeroContent.value);
    // Navigate to watch page
    navigateTo(`/watch/${currentHeroContent.value.slug}`);
  }
};

const addToList = () => {
  if (currentHeroContent.value) {
    emit("addToList", currentHeroContent.value);
    // You can add toast notification here
    console.log("Added to list:", currentHeroContent.value.title);
  }
};

// Image load handler for better performance
const onImageLoad = (event) => {
  // Image loaded successfully
  event.target.style.opacity = "1";
};

// Lifecycle
onMounted(async () => {
  await fetchHeroContent();
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

// Watch for prop changes
watch(
  () => props.autoPlay,
  (newValue) => {
    if (newValue) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  }
);

watch(
  () => props.autoPlayInterval,
  () => {
    if (props.autoPlay) {
      stopAutoPlay();
      startAutoPlay();
    }
  }
);
</script>

<style scoped>
.bg-gradient-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    transparent 100%
  );
}

/* Smooth transitions for content changes */
h1,
p {
  transition: all 0.5s ease-in-out;
}

/* Hover effects for buttons */
button:hover {
  transform: scale(1.05);
}

/* Carousel indicator animations */
.carousel-indicator {
  transition: all 0.3s ease;
}

/* Background image transition */
.bg-cover {
  transition: background-image 1s ease-in-out;
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.7s ease-out forwards;
}

.animate-slide-left {
  animation: slideInFromLeft 0.6s ease-out forwards;
}

.animate-slide-right {
  animation: slideInFromRight 0.6s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-out forwards;
}

/* Staggered animations */
.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

/* Enhanced button animations */
.btn-animate {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-animate:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 25px rgba(255, 208, 5, 0.3);
}

/* Side image hover effects */
.side-image-hover {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-image-hover:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}
</style>