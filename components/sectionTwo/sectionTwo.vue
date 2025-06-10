<template>
  <section
    class="px-4 sm:px-9 md:px-28 flex flex-col gap-7 mt-20 font-orbitron"
  >
    <div class="flex justify-between items-center gap-1 metaText">
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
      <div class="flex items-center gap-2" v-if="showSeeMore">
        <div
          class="border-grayish h-0 w-[100px] md:w-[165.4px] border-[0.85px] hidden md:block"
        ></div>
        <p
          class="text-textprimary text-smallest md:text-seemore cursor-pointer hover:text-gold transition-colors"
        >
          See More
        </p>
      </div>
    </div>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-7 text-textprimary tileHolder"
    >
      <div
        v-if="loading"
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
        <div
          class="miniplayer relative group aspect-[3/4] cursor-pointer"
          @click="navigateToContent(content.slug)"
          v-for="content in displayContent"
          :key="content.id"
        >
          <!-- Preview overlay (desktop only) -->
          <div
            class="mini-display absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
          >
            <img
              :src="
                buildImageUrl(
                  content.banner_image_id || content.thumbnail_image_id
                )
              "
              class="w-full h-full object-cover rounded-lg"
              :alt="content.title"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent rounded-lg flex flex-col justify-end p-3"
            >
              <h3 class="text-[14px] font-semibold mb-2 text-white">
                {{ content.title }}
              </h3>
              <p
                class="text-[12px] leading-[1.5] text-gray-200 line-clamp-3 mb-2"
              >
                {{ content.description }}
              </p>
              <div class="flex items-center gap-2 text-[11px] text-gray-300">
                <span>{{ formatDate(content.release_date) }}</span>
                <span
                  v-if="content.duration_in_seconds"
                  class="flex items-center"
                >
                  <span class="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                  {{ formatDuration(content.duration_in_seconds) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Main content (always visible) -->
          <div
            class="h-full flex flex-col md:group-hover:opacity-0 transition-opacity duration-300"
          >
            <img
              class="w-full flex-1 object-cover rounded-lg scale"
              :src="
                buildImageUrl(
                  content.poster_image_id || content.thumbnail_image_id
                )
              "
              :alt="content.title"
            />
            <div class="mt-2 space-y-1">
              <p class="text-[13px] leading-[1.3] font-medium line-clamp-2">
                {{ content.title }}
              </p>
              <div class="flex items-center gap-2 text-[11px] text-gray-400">
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
        </div>
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

.mini-display {
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  height: 100%;
  position: absolute;
  inset: 0;
}

.scale {
  transition: all 0.3s ease-in-out;
}

.scale:hover {
  transform: scale(1.02);
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

  /* Disable hover preview on mobile */
  .mini-display {
    display: none;
  }
}
</style>

<script setup>
import { ref, onMounted, computed } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContentService } from "../../api/services/content.service";
import { EContentType } from "../../src/types/content";
import flameIcon from "~/assets/flame.svg";
import { useRouter } from "vue-router";
import { buildImageUrl, formatDate, formatDuration } from "~/src/utils/helpers";

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
});

const anticipatedContent = ref([]);
const loading = ref(true);
const error = ref(null);

const displayContent = computed(() => {
  return props.content.length > 0 ? props.content : anticipatedContent.value;
});

const preview = (e) => {
  const miniDisplay = e.currentTarget.querySelector(".mini-display");
  if (miniDisplay) {
    miniDisplay.hidden = false;
  }
};

const close = (e) => {
  const miniDisplay = e.currentTarget.querySelector(".mini-display");
  if (miniDisplay) {
    miniDisplay.hidden = true;
  }
};

const fetchAnticipatedContent = async () => {
  if (!props.fetchContent) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      released_after: new Date().toISOString(),
      limit: 6,
      page: 1,
    });

    anticipatedContent.value = response.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const router = useRouter();

const navigateToContent = (slug) => {
  if (!slug) return;
  router.push({
    path: `/watch/${slug}`,
  });
};

const emit = defineEmits(["mounted"]);

onMounted(async () => {
  gsap.registerPlugin(ScrollTrigger);
  await fetchAnticipatedContent();
  emit("mounted");
});
</script>