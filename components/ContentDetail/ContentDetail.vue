<template>
  <div class="w-full">
    <div class="px-4 sm:px-6 md:px-9 lg:px-28">
      <div class="relative">
        <div
          class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start md:items-center"
        >
          <!-- Poster Image -->
          <div class="md:col-span-3 grid relative mb-6 md:mb-0 justify-center items-center">
            <img
              :src="
                buildImageUrl(
                  content.poster_image_id || content.thumbnail_image_id
                )
              "
              :alt="content.title"
              class="w-full max-w-xs mx-auto md:mx-0 rounded-lg shadow-lg"
            />
            <!-- Play Icon and Label Overlay -->
            <div
              v-if="showPosterOverlay"
              class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg cursor-pointer hover:bg-black/50 transition-colors duration-300 max-w-xs mx-auto"
              @click="navigateToTrailer"
            >
              <div
                class="bg-[#FFD005] p-3 md:p-4 rounded-full mb-2 md:mb-3 hover:bg-[#CE8F00] transition-colors duration-300"
              >
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-6 h-6 md:w-8 md:h-8"
                />
              </div>
              <span
                class="text-white text-xs md:text-sm font-medium bg-black/50 px-2 md:px-3 py-1 rounded-full"
                >Watch Trailer</span
              >
            </div>
          </div>

          <!-- Content Information -->
          <div class="md:col-span-9 text-white">
            <!-- Title Row with Rating -->
            <div
              class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4"
            >
              <div class="flex-1">
                <div
                  class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 mb-2"
                >
                  <h1
                    class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex items-center leading-tight"
                  >
                    {{ content.title }}
                  </h1>
                  <span
                    class="text-gray-300 text-lg sm:text-xl md:text-2xl self-start sm:self-end mb-1.5 flex items-center"
                    >{{ formatDate(content.release_date) }}</span
                  >
                </div>
              </div>
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"
              >
                <div
                  class="text-gray-300 whitespace-nowrap text-sm sm:text-base"
                >
                  {{ content.interactions?.comments_count || 0 }} Comments
                </div>
                <div
                  v-if="content.interactions?.rating"
                  class="flex items-center"
                >
                  <div class="flex">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="text-base md:text-lg leading-none"
                    >
                      <span
                        class="text-yellow-400"
                        v-if="
                          i <= Math.round(content.interactions.rating.average)
                        "
                        >★</span
                      >
                      <span class="text-gray-600" v-else>★</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Genre -->
            <div
              v-if="content[content.type]?.genres?.length"
              class="text-gray-300 mb-3 text-sm sm:text-base"
            >
              <span class="text-white font-semibold">Genre: </span>
              {{ content[content.type].genres.join(", ") }}
            </div>

            <!-- Duration -->
            <div class="text-gray-300 mb-3 text-sm sm:text-base">
              <span class="text-white font-semibold">Time: </span>
              {{ formatDuration(content.duration_in_seconds) }}
            </div>

            <!-- Cast -->
            <div
              v-if="content[content.type]?.cast?.length"
              class="text-gray-300 mb-3 text-sm sm:text-base"
            >
              <span class="text-white font-semibold">Stars: </span>
              {{ content[content.type].cast.join(", ") }}
            </div>

            <!-- Creator -->
            <div class="text-gray-300 mb-3 text-sm sm:text-base">
              <span class="text-white font-semibold">Created by: </span>
              {{ content[content.type].creator || "N/A" }}
            </div>

            <!-- Rating Box -->
            <!-- <div
              class="inline-block bg-[#FFD005] text-black px-3 py-1 rounded mb-6 font-medium"
            >
              {{
                content.interactions?.rating
                  ? content.interactions.rating.average.toFixed(1)
                  : "N/A"
              }}
            </div> -->

            <!-- Description -->
            <p
              class="text-gray-300 text-sm sm:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed"
            >
              {{ content.description }}
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                v-if="!isContentReleased"
                disabled
                class="bg-gray-500 text-white h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium cursor-not-allowed text-sm sm:text-base"
              >
                <span>Coming Soon</span>
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-4 h-4 sm:w-5 sm:h-5 opacity-50"
                />
              </button>
              <NuxtLink
                v-else-if="isAuthenticated"
                :to="`/watch/${content.slug}/video`"
                class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <span>Watch</span>
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-4 h-4 sm:w-5 sm:h-5"
                />
              </NuxtLink>
              <NuxtLink
                v-else
                to="/login"
                class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <span>Sign In to Watch</span>
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-4 h-4 sm:w-5 sm:h-5"
                />
              </NuxtLink>
              <button
                v-if="isAuthenticated"
                class="border-2 border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-3 group text-sm sm:text-base"
              >
                <span>Add to List</span>
                <img
                  src="../../assets/icons/plus.svg"
                  alt="Add"
                  class="w-4 h-4 sm:w-5 sm:h-5 group-hover:brightness-0"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { buildImageUrl, formatDate, formatDuration } from "~/src/utils/helpers";
import { useRouter } from "vue-router";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  showPosterOverlay: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const isContentReleased = computed(() => {
  if (!props.content?.release_date) return false;
  const releaseDate = new Date(props.content.release_date);
  return releaseDate <= new Date();
});

const navigateToTrailer = () => {
  if (!props.content?.slug) return;
  emit("trailer-click");
};

const emit = defineEmits(["mounted", "trailer-click"]);

onMounted(() => {
  emit("mounted");
});
</script>