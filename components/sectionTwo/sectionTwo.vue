<template>
  <section
    class="px-4 sm:px-9 md:px-28 flex flex-col gap-7 mt-20 mb-20 font-orbitron"
  >
    <div v-if="!hideHeader" class="flex items-center gap-2 metaText w-full">
      <div class="flex items-center gap-2">
        <img
          class="w-[25px] h-[25px] md:size-[35px]"
          :src="icon || flameIcon"
          :alt="iconAlt || 'Section icon'"
        />
        <h6 class="text-textprimary text-base md:text-h6">
          {{ title || "Anticipate" }}
        </h6>
      </div>
      <div
        class="border-grayish h-0 flex-1 border-[0.85px] hidden md:block"
      ></div>
      <div  class="flex items-center gap-2" v-if="showSeeMore">
        <p
          class="text-textprimary text-smallest md:text-seemore cursor-pointer hover:text-gold transition-colors"
        >
          See More
        </p>
      </div>
    </div>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 sm:gap-7 md:gap-10 text-textprimary tileHolder"
    >
      <div
        v-if="loading || !imagesLoaded"
        class="col-span-full flex justify-center items-center p-8"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"
        ></div>
      </div>
      <div v-else-if="error" class="col-span-full text-red-500 text-center p-4">
        {{ error }}
      </div>
      <template v-else>
        <NuxtLink
          :to="`/watch/${content.slug}`"
          class="miniplayer relative group cursor-pointer"
          v-for="content in displayContent"
          :key="content.id"
        >
          <!-- Two-image overlay container with CSS hover effect -->
          <div class="flex flex-col">
            <div
              class="img-stack relative w-full aspect-[3/4] rounded-lg overflow-hidden max-h-[480px] md:max-h-[560px] lg:max-h-[640px] xl:max-h-[720px] 2xl:max-h-[800px]"
            >
              <!-- Base image (poster) -->
              <img
                class="base-img w-full h-full object-cover transition-all duration-300"
                :src="getPrimaryImageUrl(content)"
                :alt="content.title"
              />

              <!-- Hover image (banner) - only show if banner exists -->
              <img
                v-if="content.banner_image_id"
                class="hover-img w-full h-full object-cover transition-all duration-300"
                :src="getHoverImageUrl(content)"
                :alt="content.title"
              />
              <!-- Hover overlay covering only the image -->
              <div
                class="hover-overlay absolute inset-0 bg-black/60 flex flex-col justify-end p-2 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none"
              >
                <p
                  class="text-white text-sm line-clamp-5 max-h-[50%] overflow-hidden"
                >
                  {{ content.description }}
                </p>
              </div>
            </div>

            <!-- Title and date/duration info beneath the image -->
            <div class="flex flex-col justify-between p-2">
              <p
                class="text-[13px] leading-[1.3] font-medium line-clamp-2 font-orbitron"
              >
                {{ content.title }}
              </p>
              <div
                class="flex items-center gap-2 text-[11px] text-gray-400 mt-2"
              >
                <span>{{ formatDate(content.release_date) }}</span>
                <span
                  v-if="content.duration_in_seconds"
                  class="flex items-center"
                >
                  <span class="w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
                  {{ formatDuration(content.duration_in_seconds) }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </template>
    </div>
  </section>
</template>

<style scoped>
.miniplayer {
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  position: relative;
}

.miniplayer:hover {
  transform: scale(1.05);
  z-index: 20;
  box-shadow: 0 4px 20px rgba(255, 208, 5, 0.2);
}

/* Two-image overlay styles */
.img-stack {
  position: relative;
  overflow: hidden;
}

.base-img {
  position: relative;
  z-index: 1;
}

.hover-img {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 2;
  transition: opacity 0.3s ease-in-out;
}

/* Hover effect - show banner image */
.miniplayer:hover .hover-img {
  opacity: 1;
}

/* Scale effect on hover */
.miniplayer:hover .base-img,
.miniplayer:hover .hover-img {
  transform: scale(1.02);
}

/* Hover overlay effect */
.hover-overlay {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  z-index: 3;
}

.miniplayer:hover .hover-overlay {
  opacity: 1;
}

@media screen and (max-width: 640px) {
  .miniplayer {
    position: relative;
    z-index: 1;
  }

  .miniplayer:hover {
    transform: none;
    box-shadow: none;
  }

  .scale:hover {
    transform: none;
  }
}
</style>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContentService } from "../../api/services/content.service";
import { EContentType } from "../../src/types/content";
import flameIcon from "~/assets/flame.svg";
import { useRouter } from "vue-router";
import { formatDate, formatDuration } from "~/src/utils/helpers";
import { useBlobImages } from "~/composables/useBlobImages";

const props = defineProps({
  title: {
    type: String,
    default: "Anticipate",
  },
  icon: {
    type: String,
    default: null,
  },
  iconAlt: {
    type: String,
    default: "Section icon",
  },
  showSeeMore: {
    type: Boolean,
    default: true,
  },
  content: {
    type: Array,
    default: () => [],
  },
  fetchContent: {
    type: Boolean,
    default: true,
  },
  hideHeader: {
    type: Boolean,
    default: false,
  },
});

const anticipatedContent = ref([]);
const loading = ref(true);
const error = ref(null);
const imagesLoaded = ref(false);

const { getPrimaryImageUrl, getHoverImageUrl, preloadContentImages } =
  useBlobImages();

const displayContent = computed(() => {
  const content =
    props.content.length > 0 ? props.content : anticipatedContent.value;
  console.log("SectionTwo displayContent:", content.length, "items");
  if (content.length > 0) {
    console.log("First content item:", content[3]);
    console.log("First item poster ID:", content[3]?.poster_image_id);
    console.log("First item banner ID:", content[3]?.banner_image_id);
    console.log("First item thumbnail ID:", content[3]?.thumbnail_image_id);
    console.log("First item poster:", getPrimaryImageUrl(content[3]));
    console.log("First item banner:", getHoverImageUrl(content[3]));
  }
  return content;
});

const fetchAnticipatedContent = async () => {
  if (!props.fetchContent) {
    loading.value = false;
    imagesLoaded.value = true;
    return;
  }

  try {
    loading.value = true;
    imagesLoaded.value = false;

    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      // released_after: new Date().toISOString(),
      limit: 6,
      page: 1,
    });

    anticipatedContent.value = response.data;

    // Preload all images (poster, banner, thumbnail) and wait for them
    if (response.data && response.data.length > 0) {
      try {
        await preloadContentImages(response.data, "public");
        console.log("SectionTwo: Images preloaded successfully");
        imagesLoaded.value = true;
      } catch (error) {
        console.warn("SectionTwo: Failed to preload some images:", error);
        imagesLoaded.value = true; // Show content even if some images fail
      }
    } else {
      imagesLoaded.value = true;
    }
  } catch (err) {
    error.value = err.message;
    imagesLoaded.value = true; // Show content even if there's an error
  } finally {
    loading.value = false;
  }
};

const router = useRouter();

const emit = defineEmits(["mounted"]);

// Watch for props.content changes and preload images
watch(
  () => props.content,
  async (newContent) => {
    if (newContent && newContent.length > 0) {
      console.log("SectionTwo: Props content changed, preloading images...");
      imagesLoaded.value = false;

      try {
        await preloadContentImages(newContent, "public");
        console.log("SectionTwo: Props images preloaded successfully");
        imagesLoaded.value = true;
      } catch (error) {
        console.warn("SectionTwo: Failed to preload props images:", error);
        imagesLoaded.value = true; // Show content even if some images fail
      }
    } else {
      imagesLoaded.value = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  gsap.registerPlugin(ScrollTrigger);
  await fetchAnticipatedContent();
  emit("mounted");
});
</script>