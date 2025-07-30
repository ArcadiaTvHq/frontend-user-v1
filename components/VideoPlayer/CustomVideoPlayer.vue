<template>
  <div
    class="custom-video-player w-full h-full bg-black overflow-hidden relative"
  >
    <!-- Video Container -->
    <div class="relative w-full h-full">
      <video
        ref="videoPlayer"
        :poster="poster"
        :autoplay="autoplay"
        :muted="muted"
        :controls="controls"
        :preload="preload"
        :loop="loop"
        :volume="volume"
        class="w-full h-full object-contain cursor-pointer"
        @canplay="onCanPlay"
        @playing="onPlaying"
        @waiting="onWaiting"
        @error="onError"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @timeupdate="handleTimeUpdate"
        @click="handleVideoClick"
        @loadedmetadata="onLoadedMetadata"
      >
        <!-- Fallback message -->
        <p class="text-white text-center p-4">
          Your browser does not support this video format.
        </p>
      </video>

      <!-- Loading/Buffering Overlay -->
      <div
        v-if="!streamUrl || !canPlay || bufferedPercent < 10"
        class="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10"
        :style="
          bannerImage
            ? `background-image: url(${buildImageUrl(
                bannerImage,
                'size3'
              )}); background-size: cover; background-position: center;`
            : ''
        "
      >
        <div v-if="showLoading" class="text-center relative z-10">
          <img
            class="w-[100px] h-[100px] object-contain animate-pulse mb-4"
            src="@/assets/logo2.png"
            alt="Loading"
          />
          <p class="mb-2 text-lg font-medium text-white">
            {{ getLoadingMessage() }}
          </p>
          <p
            v-if="streamUrl && bufferedPercent > 0"
            class="text-sm text-gray-300"
          >
            {{ Math.round(bufferedPercent) }}% buffered
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { ContentService } from "~/api/services/content.service";
import { buildImageUrl, preloadImage } from "~/src/utils/helpers";
import Hls from "hls.js";

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
  loop: { type: Boolean, default: true },
  volume: { type: Number, default: 1.0 },
  showLoading: { type: Boolean, default: true },
});

const emit = defineEmits([
  "ready",
  "error",
  "videoStarted",
  "videoPaused",
  "videoEnded",
  "timeUpdate",
]);

// Reactive state
const videoPlayer = ref(null);
const streamUrl = ref(null);
const isLoading = ref(true);
const loadingMessage = ref("Loading...");
const error = ref(null);
const isPlaying = ref(false);
const isBuffering = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progressPercent = ref(0);
const bufferedPercent = ref(0);
const lastEmittedSecond = ref(-1);
const canPlay = ref(false);

// HLS instance
let hlsInstance = null;

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to calculate buffered percentage
const calculateBufferedPercent = () => {
  if (!videoPlayer.value || !videoPlayer.value.buffered) return 0;
  const buffered = videoPlayer.value.buffered;
  if (buffered.length === 0) return 0;

  const duration = videoPlayer.value.duration;
  if (!duration) return 0;

  const bufferedEnd = buffered.end(buffered.length - 1);
  return (bufferedEnd / duration) * 100;
};

// Helper function to get loading message
const getLoadingMessage = () => {
  if (!streamUrl.value) {
    return loadingMessage.value;
  }
  if (!canPlay.value) {
    return "Loading video...";
  }
  if (bufferedPercent.value < 10) {
    return "Buffering...";
  }
  return "Loading...";
};

// Event handlers
const onCanPlay = () => {
  console.log("✅ Video can play");
  canPlay.value = true;
  isLoading.value = false;
  emit("ready");
};

const onPlaying = () => {
  console.log("▶️ Video is playing");
  isPlaying.value = true;
  isBuffering.value = false;
};

const onWaiting = () => {
  console.log("⏳ Video is waiting/buffering");
  isBuffering.value = true;
};

const onError = (e) => {
  const video = e.target;
  const errorCode = video.error?.code;

  console.log("❌ Video error:", {
    errorCode,
    error: video.error,
    src: video.src,
    currentSrc: video.currentSrc,
  });

  let errorMessage = "Video cannot be played. Please try again.";

  switch (errorCode) {
    case 1:
      errorMessage = "Video loading was aborted.";
      break;
    case 2:
      errorMessage = "Network error occurred while loading video.";
      break;
    case 3:
      errorMessage = "Video decoding failed.";
      break;
    case 4:
      errorMessage = "Video format is not supported.";
      break;
  }

  error.value = errorMessage;
  emit("error", { code: errorCode, message: errorMessage });
};

const handlePlay = () => {
  isPlaying.value = true;
  console.log("▶️ Play event triggered");
  emit("videoStarted");
};

const handlePause = () => {
  isPlaying.value = false;
  emit("videoPaused");
};

const handleEnded = () => {
  isPlaying.value = false;
  emit("videoEnded");
};

const handleTimeUpdate = (e) => {
  const current = e.target.currentTime;
  const total = e.target.duration;

  currentTime.value = current;
  duration.value = total;
  progressPercent.value = total > 0 ? (current / total) * 100 : 0;
  bufferedPercent.value = calculateBufferedPercent();

  // Auto-play when both conditions are met
  if (
    canPlay.value &&
    bufferedPercent.value >= 10 &&
    !isPlaying.value &&
    props.autoplay
  ) {
    console.log(
      "🚀 Auto-playing video - canPlay:",
      canPlay.value,
      "buffered:",
      Math.round(bufferedPercent.value) + "%"
    );
    videoPlayer.value.play().catch((err) => {
      console.warn("Auto-play failed:", err);
    });
  }

  if (Math.floor(current) !== lastEmittedSecond.value) {
    lastEmittedSecond.value = Math.floor(current);
    console.log("⏱️ Time update:", {
      current: formatTime(current),
      total: formatTime(total),
      progress: Math.round(progressPercent.value) + "%",
      buffered: Math.round(bufferedPercent.value) + "%",
    });
    emit("timeUpdate", {
      currentTime: current,
      duration: total,
      percentage: progressPercent.value,
    });
  }
};

const handleVideoClick = () => {
  if (!props.controls) {
    togglePlay();
  }
};

// Player control methods
const togglePlay = () => {
  if (videoPlayer.value) {
    if (isPlaying.value) {
      videoPlayer.value.pause();
    } else {
      videoPlayer.value.play();
    }
  }
};

const setVolume = (newVolume) => {
  if (videoPlayer.value) {
    videoPlayer.value.volume = Math.max(0, Math.min(1, newVolume));
  }
};

const setMuted = (muted) => {
  if (videoPlayer.value) {
    videoPlayer.value.muted = muted;
    console.log("🔇 Muted set to:", muted);
  }
};

const seekTo = (time) => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = time;
  }
};

const retryLoad = () => {
  error.value = null;
  initializePlayer();
};

// --- HLS Initialization ---
const initializeHLS = (url) => {
  if (!url || !videoPlayer.value) return;

  console.log("🎬 Initializing HLS with URL:", url);

  // Clean up existing HLS instance
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (Hls.isSupported()) {
    console.log("🔧 Using HLS.js for streaming");
    hlsInstance = new Hls({
      debug: false,
      enableWorker: true,
      lowLatencyMode: false,
    });

    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(videoPlayer.value);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("✅ HLS manifest loaded successfully");
      // Don't auto-play here - let handleTimeUpdate handle it when buffering is ready
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS.js error:", data);
      emit("error", { code: data.details, message: data.type });
    });
  } else if (videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")) {
    console.log("🍎 Using native HLS support (Safari)");
    videoPlayer.value.src = url;
  } else {
    console.log("⚠️ HLS not supported, using URL directly");
    // Only set src directly if HLS.js is definitely not available
    if (videoPlayer.value && typeof Hls === "undefined") {
      videoPlayer.value.src = url;
      console.log("✅ Set video src for fallback:", url);
    } else {
      console.log("⏳ Waiting for HLS.js to load before setting video src");
    }
  }
};

// Fetch stream URL
const fetchStreamUrl = async () => {
  if (!props.contentId) return;

  try {
    loadingMessage.value = "Loading video...";

    const response =
      props.playerType === "trailer"
        ? await ContentService.getTrailerSignedUrl(props.contentId)
        : await ContentService.getVideoSignedUrl(props.contentId);

    console.log("API Response:", response);

    if (response?.data?.url) {
      let url = response.data.url;
      console.log("Original URL:", url);

      // Convert iframe URL to direct video URL
      if (url.includes("cloudflarestream.com") && url.includes("/iframe")) {
        const tokenMatch = url.match(
          /cloudflarestream\.com\/([^\/]+)\/([^\/]+)\/iframe/
        );
        if (tokenMatch) {
          const videoId = tokenMatch[1];
          const signedToken = tokenMatch[2];
          const customerCode =
            url.match(/customer-([^.]+)\.cloudflarestream\.com/)?.[1] || "";
          url = `https://customer-${customerCode}.cloudflarestream.com/${videoId}/${signedToken}/manifest/video.m3u8`;
          console.log("Converted HLS URL:", url);
        }
      }

      streamUrl.value = url;
      console.log("Final streamUrl:", streamUrl.value);

      // Initialize HLS.js immediately when URL is available
      nextTick(() => {
        if (videoPlayer.value) {
          initializeHLS(url);
        } else {
          console.log("Video player not found");
        }
      });

      isLoading.value = false;

      // Schedule refresh before URL expires
      if (response.expires_in_seconds) {
        const refreshTime = (response.expires_in_seconds - 60) * 1000;
        setTimeout(() => {
          fetchStreamUrl();
        }, refreshTime);
      }
    } else {
      throw new Error("No URL in response");
    }
  } catch (error) {
    console.error(`Error fetching ${props.playerType} URL:`, error);
    loadingMessage.value = "Unable to load video. Please try again later.";
    isLoading.value = false;
  }
};

const initializePlayer = () => {
  if (props.contentId) {
    streamUrl.value = null;
    isLoading.value = true;
    loadingMessage.value = "Loading...";
    error.value = null;
    isBuffering.value = false;
    isPlaying.value = false;
    canPlay.value = false;
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

// Watch for changes to muted prop
watch(
  () => props.muted,
  (newMuted) => {
    nextTick(() => {
      if (videoPlayer.value) {
        setMuted(newMuted);
      }
    });
  }
);

// Watch for changes to volume prop
watch(
  () => props.volume,
  (newVolume) => {
    nextTick(() => {
      if (videoPlayer.value) {
        setVolume(newVolume);
      }
    });
  }
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

// Cleanup on unmount
onUnmounted(() => {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});

// Expose player methods for parent components
defineExpose({
  play: () => videoPlayer.value?.play(),
  pause: () => videoPlayer.value?.pause(),
  setVolume,
  setMuted,
  seekTo,
  togglePlay,
  retryLoad,
});
</script>

<style scoped>
.custom-video-player {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

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

video {
  outline: none;
  transition: all 0.3s ease;
}

video:hover {
  transform: scale(1.02);
}
</style>
