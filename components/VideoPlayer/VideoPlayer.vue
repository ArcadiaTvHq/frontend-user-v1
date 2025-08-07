<template>
  <div class="w-full h-full bg-gray-900 overflow-hidden">
    <div
      v-if="!streamUrl"
      class="w-full h-full flex items-center justify-center text-white relative"
      :style="
        bannerImage
          ? `background-image: url(${buildImageUrl(
              bannerImage,
              'size3'
            )}); background-size: cover; background-position: center;`
          : ''
      "
    >
      <!-- Black overlay -->
      <!-- <div class="absolute inset-0 bg-black/70"></div> -->

      <div class="text-center relative z-10">
        <img
          class="w-[100px] h-[100px] object-contain animate-pulse mb-4"
          src="@/assets/logo2.png"
          alt="Loading"
        />
        <p class="mb-2">{{ loadingMessage }}</p>
        <p v-if="retryCount > 0" class="text-sm text-gray-400">
          Retry attempt: {{ retryCount }}
        </p>
      </div>
    </div>

    <div v-else class="relative w-full h-full">
      <!-- Video Player -->
      <iframe
        ref="player"
        :src="streamUrl"
        :autoplay="autoplay"
        :muted="muted"
        :controls="controls"
        :preload="preload"
        :poster="poster"
        :loop="loop"
        :volume="volume"
        :primarycolor="primaryColor"
        :letterboxcolor="letterboxColor"
        @canplay="onCanPlay"
        @playing="onPlaying"
        @waiting="onWaiting"
        @error="onError"
        @play="() => handlePlay()"
        @pause="() => handlePause()"
        @ended="() => handleEnded()"
        @timeupdate="handleTimeUpdate"
        @click="handleVideoClick"
        class="w-full h-full absolute inset-0 border-0 transition-all duration-300 ease-in-out cursor-pointer"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
      <!-- Buffering Loader -->
      <!-- <div
        v-if="isBuffering"
        class="absolute inset-0 flex items-center justify-center bg-black/60 z-10"
      >
        <img
          class="w-[100px] h-[100px] object-contain animate-pulse"
          src="@/assets/logo2.png"
          alt="Buffering"
        />
      </div> -->

      <!-- Error Message -->
      <div
        v-if="error"
        class="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-center px-4 z-10"
      >
        <div>
          <p class="text-lg font-semibold">⚠️ Video unavailable</p>
          <p class="text-sm mt-2">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { ContentService } from "~/api/services/content.service";
import { buildImageUrl, preloadImage } from "~/src/utils/helpers";

const props = defineProps({
  contentId: {
    type: String,
    required: true,
  },
  playerType: {
    type: String,
    required: true,
    validator: (value) => ["video", "trailer"].includes(value),
  },
  bannerImage: {
    type: String,
    default: null,
  },
  poster: String,
  autoplay: { type: Boolean, default: true },
  muted: { type: Boolean, default: true },
  controls: { type: Boolean, default: true },
  preload: { type: String, default: "auto" },
  loop: { type: Boolean, default: false },
  volume: { type: Number, default: 0.8 },
  primaryColor: { type: String, default: "#FFD700" },
  letterboxColor: { type: String, default: "#000000" },
});

const emit = defineEmits(["videoStarted"]);

const streamUrl = ref(null);
const retryCount = ref(0);
const isLoading = ref(true);
const loadingMessage = ref("Loading...");

const isBuffering = ref(false);
const error = ref(null);
const lastEmittedSecond = ref(-1);

const onWaiting = () => {
  isBuffering.value = true;
};

const onPlaying = () => {
  isBuffering.value = false;
};

const onCanPlay = () => {
  isBuffering.value = false;
};

const onError = (e) => {
  error.value = "This video cannot be played. Please try again later.";
};

const handlePlay = () => {
  // Emit event when video starts playing
  emit("videoStarted");
};

const handleVideoClick = () => {
  // Try to unmute when video is clicked
  const iframe = document.querySelector("iframe");
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          method: "setMuted",
          value: false,
        }),
        "*"
      );
    } catch (error) {
      console.log("Could not unmute on click:", error);
    }
  }
};

const handlePause = () => {};

const handleEnded = () => {};

const handleTimeUpdate = (e) => {
  const current = e?.target?.currentTime;
  if (Math.floor(current) !== lastEmittedSecond.value) {
    lastEmittedSecond.value = Math.floor(current);
  }
};

// Retry configuration
const MAX_RETRIES = 10; // Maximum number of retries
const INITIAL_RETRY_DELAY = 2000; // Start with 2 seconds
const MAX_RETRY_DELAY = 10000; // Maximum 10 seconds between retries

const getRetryDelay = (attempt) => {
  // Exponential backoff with maximum delay
  return Math.min(
    INITIAL_RETRY_DELAY * Math.pow(1.5, attempt),
    MAX_RETRY_DELAY
  );
};

const resetState = () => {
  streamUrl.value = null;
  retryCount.value = 0;
  isLoading.value = true;
  loadingMessage.value = "Loading...";
};

const fetchStreamUrl = async (isRetry = false) => {
  if (!props.contentId) return;

  try {
    loadingMessage.value = isRetry
      ? "Retrying to load video..."
      : "Loading video...";

    const response =
      props.playerType === "trailer"
        ? await ContentService.getTrailerSignedUrl(props.contentId)
        : await ContentService.getVideoSignedUrl(props.contentId);

    if (response?.data?.url) {
      // Add autoplay parameters to the URL
      let url = response.data.url;
      const params = [];

      if (props.autoplay) {
        params.push("autoplay=1");
        // Include muted for autoplay to work in most browsers
        if (props.muted) {
          params.push("muted=1");
        }
      }

      if (props.loop) {
        params.push("loop=1");
      }

      if (params.length > 0) {
        const separator = url.includes("?") ? "&" : "?";
        url += `${separator}${params.join("&")}`;
      }

      streamUrl.value = url;
      isLoading.value = false;
      retryCount.value = 0;

      // Schedule refresh before URL expires
      if (response.expires_in_seconds) {
        const refreshTime = (response.expires_in_seconds - 60) * 1000; // Refresh 1 minute before expiry
        setTimeout(() => {
          fetchStreamUrl(true);
        }, refreshTime);
      }
    } else {
      throw new Error("No URL in response");
    }
  } catch (error) {
    console.error(`Error fetching ${props.playerType} URL:`, error);

    if (retryCount.value < MAX_RETRIES) {
      retryCount.value++;
      const delay = getRetryDelay(retryCount.value);

      loadingMessage.value = `Retrying in ${Math.round(
        delay / 1000
      )} seconds...`;

      setTimeout(() => {
        fetchStreamUrl(true);
      }, delay);
    } else {
      loadingMessage.value = "Unable to load video. Please try again later.";
      isLoading.value = false;
    }
  }
};

// Initialize or handle prop changes
const initializePlayer = () => {
  if (props.contentId) {
    resetState();
    fetchStreamUrl();
  }
};

// Watch for changes to contentId
watch(
  () => props.contentId,
  (newContentId, oldContentId) => {
    if (newContentId !== oldContentId) {
      initializePlayer();
    }
  },
  { immediate: true }
);

// Preload banner image when it changes
watch(
  () => props.bannerImage,
  async (newBannerImage) => {
    if (newBannerImage) {
      try {
        await preloadImage(newBannerImage, "size3");
      } catch (err) {
        console.warn("Failed to preload banner image:", err);
      }
    }
  },
  { immediate: true }
);

// Watch for changes to playerType
watch(
  () => props.playerType,
  (newType, oldType) => {
    if (newType !== oldType && props.contentId) {
      initializePlayer();
    }
  }
);

// Watch for changes to muted prop
watch(
  () => props.muted,
  (newMuted) => {
    if (!newMuted) {
      // Try to unmute without refreshing the video
      setTimeout(() => {
        const iframe = document.querySelector("iframe");
        if (iframe && iframe.contentWindow) {
          try {
            // Try postMessage to unmute
            iframe.contentWindow.postMessage(
              JSON.stringify({
                method: "setMuted",
                value: false,
              }),
              "*"
            );

            iframe.contentWindow.postMessage(
              JSON.stringify({
                method: "unmute",
              }),
              "*"
            );
          } catch (error) {
            console.log("Could not unmute video:", error);
          }
        }
      }, 300);
    }
  }
);

// Also initialize on mount to handle direct navigation
onMounted(() => {
  initializePlayer();
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
