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
        @canplaythrough="onCanPlayThrough"
        @progress="onProgress"
      >
        <!-- Fallback message -->
        <p class="text-white text-center p-4">
          Your browser does not support this video format.
        </p>
      </video>

      <!-- Loading/Buffering Overlay -->
      <div
        v-if="!streamUrl || !canPlay"
        class="absolute inset-0 loading-overlay flex items-center justify-center z-10 transition-all"
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
          <!-- Buffering Progress Bar -->
          <div
            v-if="streamUrl && bufferedPercent > 0"
            class="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden"
          >
            <div
              class="h-full bg-blue-500 transition-all duration-300 ease-out"
              :style="{ width: Math.min(bufferedPercent, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Error State Overlay -->
      <div
        v-if="error && !isLoading"
        class="absolute inset-0 error-state flex items-center justify-center z-20 transition-all"
      >
        <div class="text-center text-white p-6 max-w-sm">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h3 class="text-base font-semibold mb-2">Video Error</h3>
          <p class="text-sm text-gray-300 mb-4">{{ error }}</p>
          <button
            @click="retryLoad"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from "vue";
import { ContentService } from "~/api/services/content.service";
import { buildImageUrl, preloadImage } from "~/src/utils/helpers";
import Hls from "hls.js";

const props = defineProps({
  contentId: {
    type: String,
    required: false,
  },
  contentSlug: {
    type: String,
    required: false,
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
  autoplay: { type: Boolean, default: false },
  muted: { type: Boolean, default: true },
  controls: { type: Boolean, default: true },
  preload: { type: String, default: "auto" },
  loop: { type: Boolean, default: true },
  volume: { type: Number, default: 1.0 },
  showLoading: { type: Boolean, default: true },
  isPlaying: { type: Boolean, default: null }, // null means use internal state, true/false means control externally
});

const emit = defineEmits([
  "ready",
  "error",
  "videoStarted",
  "videoPaused",
  "videoEnded",
  "timeUpdate",
  "update:isPlaying", // For v-model support
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
const isRetrying = ref(false); // Flag to track retry operations

// HLS instance
let hlsInstance = null;

// Trailer playback management - no session tracking needed

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to calculate buffered percentage
const calculateBufferedPercent = () => {
  // Simple approach: show 0% when loading, 100% when ready
  if (!videoPlayer.value || videoPlayer.value.readyState < 4) {
    return 0;
  }
  return 100;
};

// Helper function to get loading message
const getLoadingMessage = () => {
  if (!streamUrl.value) {
    return loadingMessage.value;
  }
  if (!canPlay.value) {
    return "Loading video...";
  }
  return "Ready to play!";
};

// Event handlers
const onCanPlay = () => {
  canPlay.value = true;
  isLoading.value = false;

  // Force a buffering check when video can play
  bufferedPercent.value = calculateBufferedPercent();

  // Auto-play immediately when video can play, but only if not interrupted
  if (props.autoplay && !isPlaying.value && !error.value && !isRetrying.value) {
    // Small delay to ensure the video is fully ready
    setTimeout(() => {
      if (
        canPlay.value &&
        !error.value &&
        !isRetrying.value &&
        videoPlayer.value
      ) {
        videoPlayer.value.play().catch((err) => {
          // Auto-play handling
        });
      }
    }, 100);
  }

  emit("ready");
};

const onPlaying = () => {
  isPlaying.value = true;
  isBuffering.value = false;
};

const onWaiting = () => {
  isBuffering.value = true;
};

const onError = (e) => {
  const video = e.target;
  const errorCode = video.error?.code;

  let errorMessage = "Video cannot be played. Please try again.";
  let errorType = "GENERAL_ERROR";

  switch (errorCode) {
    case 1:
      errorMessage = "Video loading was aborted.";
      errorType = "ABORTED";
      break;
    case 2:
      errorMessage = "Network error occurred while loading video.";
      errorType = "NETWORK_ERROR";
      break;
    case 3:
      errorMessage = "Video decoding failed.";
      errorType = "DECODE_ERROR";
      break;
    case 4:
      errorMessage = "Video format is not supported.";
      errorType = "FORMAT_ERROR";
      break;
    default:
      if (errorCode === "FETCH_FAILED") {
        errorMessage = "Failed to load video. Please check your connection.";
        errorType = "FETCH_FAILED";
      } else if (errorCode === "SESSION_FAILED") {
        errorMessage = "Failed to start playback session. Please try again.";
        errorType = "SESSION_FAILED";
      }
      break;
  }

  error.value = errorMessage;
  emit("error", {
    code: errorCode || errorType,
    message: errorMessage,
    type: errorType,
    details: video.error,
  });

  // Auto-retry on network errors (code 2) or if URL might be expired
  if (
    errorCode === 2 ||
    errorType === "NETWORK_ERROR" ||
    errorType === "FETCH_FAILED"
  ) {
    // Auto-retrying due to network error or missing URL
    setTimeout(() => {
      fetchStreamUrl();
    }, 2000); // Wait 2 seconds before retry
  }
};

const handlePlay = () => {
  isPlaying.value = true;
  emit("update:isPlaying", true); // For v-model support
  emit("videoStarted");
};

const handlePause = () => {
  isPlaying.value = false;
  emit("update:isPlaying", false); // For v-model support
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

  // Auto-play when video can play and autoplay is enabled
  if (canPlay.value && !isPlaying.value && props.autoplay && !error.value) {
    // Auto-playing video
    // Small delay to prevent rapid auto-play attempts
    setTimeout(() => {
      if (
        canPlay.value &&
        !isPlaying.value &&
        !error.value &&
        videoPlayer.value
      ) {
        videoPlayer.value.play().catch((err) => {
          // Auto-play handling
        });
      }
    }, 200);
  }

  if (Math.floor(current) !== lastEmittedSecond.value) {
    lastEmittedSecond.value = Math.floor(current);
    // Time update
    emit("timeUpdate", {
      currentTime: current,
      duration: total,
      percentage: progressPercent.value,
    });
  }
};

const onLoadedMetadata = () => {
  duration.value = videoPlayer.value.duration;

  // Check buffering when metadata is loaded
  bufferedPercent.value = calculateBufferedPercent();
};

const onCanPlayThrough = () => {
  // Auto-play immediately when video can play through
  if (props.autoplay && !isPlaying.value) {
    videoPlayer.value.play().catch((err) => {
      // Auto-play failed
    });
  }
};

const onProgress = () => {
  // Update buffering progress when new data is downloaded
  bufferedPercent.value = calculateBufferedPercent();
  // Buffering progress
};

const handleVideoClick = () => {
  if (!props.controls) {
    togglePlay();
  }
};

// Player control methods
const togglePlay = () => {
  if (videoPlayer.value && canPlay.value) {
    if (isPlaying.value) {
      videoPlayer.value.pause();
    } else {
      videoPlayer.value.play().catch((err) => {
        console.warn("Failed to play video:", err);
      });
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
    // Muted set
  }
};

const seekTo = (time) => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = time;
  }
};

const retryLoad = () => {
  // Retrying video load

  // Set retry flag to prevent play operations
  isRetrying.value = true;

  // Clear error state first
  error.value = null;

  // Stop any ongoing playback to prevent interruption
  if (videoPlayer.value) {
    try {
      // Pause the video if it's playing
      if (!videoPlayer.value.paused) {
        videoPlayer.value.pause();
      }

      // Reset the video element
      videoPlayer.value.load();

      // Clear any existing source
      videoPlayer.value.removeAttribute("src");
      videoPlayer.value.load();
    } catch (e) {
      console.warn("Error cleaning up video element:", e);
    }
  }

  // Reset all state variables
  isLoading.value = true;
  loadingMessage.value = "Retrying...";
  canPlay.value = false;
  isPlaying.value = false;
  isBuffering.value = false;
  currentTime.value = 0;
  duration.value = 0;
  progressPercent.value = 0;
  bufferedPercent.value = 0;
  lastEmittedSecond.value = -1;

  // Clear any existing HLS instance
  if (hlsInstance) {
    try {
      hlsInstance.destroy();
      hlsInstance = null;
    } catch (e) {
      console.warn("Error destroying HLS instance:", e);
    }
  }

  // Small delay to ensure cleanup is complete before re-fetching
  setTimeout(() => {
    fetchStreamUrl();
  }, 200);
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
      // Auto-play immediately when manifest is ready, but only if not interrupted
      if (props.autoplay && !isPlaying.value && !error.value) {
        // Small delay to ensure the manifest is fully processed
        setTimeout(() => {
          if (
            canPlay.value &&
            !error.value &&
            videoPlayer.value &&
            !videoPlayer.value.paused
          ) {
            videoPlayer.value.play().catch((err) => {
              if (err.name !== "AbortError") {
                console.warn("Auto-play failed:", err);
              } else {
                console.log("Auto-play was interrupted (likely due to retry)");
              }
            });
          }
        }, 150);
      }
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS.js error:", data);

      let errorMessage = "HLS streaming error occurred.";
      let errorType = "HLS_ERROR";

      // Categorize HLS errors
      switch (data.details) {
        case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
          errorMessage =
            "Failed to load video manifest. Please check your connection.";
          errorType = "MANIFEST_LOAD_ERROR";
          break;
        case Hls.ErrorDetails.MANIFEST_PARSE_ERROR:
          errorMessage = "Video manifest format error. Please try again.";
          errorType = "MANIFEST_PARSE_ERROR";
          break;
        case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
          errorMessage =
            "Failed to load video quality level. Please try again.";
          errorType = "LEVEL_LOAD_ERROR";
          break;
        case Hls.ErrorDetails.LEVEL_SWITCH_ERROR:
          errorMessage = "Failed to switch video quality. Please try again.";
          errorType = "LEVEL_SWITCH_ERROR";
          break;
        case Hls.ErrorDetails.FRAG_LOAD_ERROR:
          errorMessage =
            "Failed to load video segment. Please check your connection.";
          errorType = "FRAG_LOAD_ERROR";
          break;
        case Hls.ErrorDetails.FRAG_DECRYPT_ERROR:
          errorMessage = "Video decryption error. Please try again.";
          errorType = "FRAG_DECRYPT_ERROR";
          break;
        default:
          errorMessage = "Video streaming error. Please try again.";
          break;
      }

      emit("error", {
        code: data.details,
        message: errorMessage,
        type: errorType,
        details: data,
      });
    });

    hlsInstance.on(Hls.Events.FRAG_LOADED, () => {
      // Update buffering progress when fragments are loaded
      bufferedPercent.value = calculateBufferedPercent();
    });
  } else if (videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")) {
    console.log("🍎 Using native HLS support (Safari)");
    videoPlayer.value.src = url;
    // Auto-play immediately for native HLS, but only if not interrupted
    if (props.autoplay && !isPlaying.value && !error.value) {
      // Small delay to ensure the source is set
      setTimeout(() => {
        if (canPlay.value && !error.value && videoPlayer.value) {
          videoPlayer.value.play().catch((err) => {
            if (err.name !== "AbortError") {
              console.warn("Auto-play failed:", err);
            } else {
              console.log("Auto-play was interrupted (likely due to retry)");
            }
          });
        }
      }, 100);
    }
  } else {
    console.log("⚠️ HLS not supported, using URL directly");
    // Only set src directly if HLS.js is definitely not available
    if (videoPlayer.value && typeof Hls === "undefined") {
      videoPlayer.value.src = url;
      console.log("✅ Set video src for fallback:", url);
      // Auto-play immediately for fallback, but only if not interrupted
      if (props.autoplay && !isPlaying.value && !error.value) {
        // Small delay to ensure the source is set
        setTimeout(() => {
          if (canPlay.value && !error.value && videoPlayer.value) {
            videoPlayer.value.play().catch((err) => {
              if (err.name !== "AbortError") {
                console.warn("Auto-play failed:", err);
              } else {
                console.log("Auto-play was interrupted (likely due to retry)");
              }
            });
          }
        }, 100);
      }
    } else {
      console.log("⏳ Waiting for HLS.js to load before setting video src");
    }
  }
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // Start with 1 second
const MAX_RETRY_DELAY = 5000; // Maximum 5 seconds between retries

const getRetryDelay = (attempt) => {
  // Exponential backoff with maximum delay
  return Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
    MAX_RETRY_DELAY
  );
};

// Fetch stream URL with retry logic
const fetchStreamUrl = async (isRetry = false, retryCount = 0) => {
  if (!props.contentId && !props.contentSlug) return;

  try {
    loadingMessage.value = isRetry
      ? `Retrying to load video... (${retryCount + 1}/${MAX_RETRIES})`
      : "Loading video...";

    let response;
    if (props.playerType === "trailer") {
      if (props.contentSlug) {
        response = await ContentService.getTrailerUrlBySlug(props.contentSlug);
      } else {
        response = await ContentService.getTrailerSignedUrl(props.contentId);
      }
    } else {
      response = await ContentService.getVideoSignedUrl(props.contentId);
    }

    console.log("API Response:", response);

    if (response?.data?.signed_url) {
      let url = response.data.signed_url;
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
      // Reset retry flag when successful
      isRetrying.value = false;
    } else {
      throw new Error("No URL in response");
    }
  } catch (error) {
    console.error(`Error fetching ${props.playerType} URL:`, error);

    if (retryCount < MAX_RETRIES) {
      const delay = getRetryDelay(retryCount + 1);
      console.log(
        `Retrying video fetch in ${delay}ms (attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );

      setTimeout(() => {
        fetchStreamUrl(true, retryCount + 1);
      }, delay);
    } else {
      console.error(`Failed to fetch video after ${MAX_RETRIES} attempts`);
      loadingMessage.value = "Unable to load video. Please try again later.";
      isLoading.value = false;

      let errorMessage = "Failed to load video after multiple attempts.";
      let errorType = "FETCH_FAILED";

      // Provide more specific error messages based on the error
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
        errorType = "NETWORK_ERROR";
      } else if (error.name === "AbortError") {
        errorMessage = "Request was cancelled. Please try again.";
        errorType = "ABORTED";
      } else if (error.response?.status === 404) {
        errorMessage = "Video not found. Please check the URL.";
        errorType = "NOT_FOUND";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
        errorType = "SERVER_ERROR";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. Please check your permissions.";
        errorType = "ACCESS_DENIED";
      }

      emit("error", {
        code: errorType,
        message: errorMessage,
        type: errorType,
        details: error,
      });
    }
  }
};

const initializePlayer = () => {
  if (props.contentId || props.contentSlug) {
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

// Watch for changes to contentId or contentSlug
watch(
  [() => props.contentId, () => props.contentSlug],
  ([newContentId, newContentSlug], [oldContentId, oldContentSlug]) => {
    if (newContentId !== oldContentId || newContentSlug !== oldContentSlug) {
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

// Watch for changes to isPlaying prop and sync with video player
watch(
  () => props.isPlaying,
  (newIsPlaying) => {
    if (newIsPlaying !== null && videoPlayer.value && canPlay.value) {
      if (newIsPlaying && !isPlaying.value) {
        videoPlayer.value.play().catch((err) => {
          console.warn("Failed to play video:", err);
        });
      } else if (!newIsPlaying && isPlaying.value) {
        videoPlayer.value.pause();
      }
    }
  }
);

// Auto-start video 5 seconds after mounting
const autoStartTimer = ref(null);
const startAutoPlay = () => {
  if (autoStartTimer.value) {
    clearTimeout(autoStartTimer.value);
  }

  autoStartTimer.value = setTimeout(() => {
    if (canPlay.value && !isPlaying.value && !error.value) {
      emit("update:isPlaying", true);
    }
  }, 19000); // 5 seconds delay
};

// Start auto-play timer when video is ready
watch(
  () => canPlay.value,
  (newCanPlay) => {
    if (newCanPlay && props.autoplay === false) {
      startAutoPlay();
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  // Clear auto-start timer
  if (autoStartTimer.value) {
    clearTimeout(autoStartTimer.value);
    autoStartTimer.value = null;
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
  refreshUrl: () => {
    console.log("🔄 Manual URL refresh requested");
    fetchStreamUrl();
  },
  getStreamUrl: () => streamUrl.value,
  getUrlHealth: () => ({
    hasUrl: !!streamUrl.value,
    canPlay: canPlay.value,
    isPlaying: isPlaying.value,
    hasError: !!error.value,
    isLoading: isLoading.value,
  }),
  // Error handling methods
  clearError: () => {
    error.value = null;
  },
  forceRetry: () => {
    retryLoad();
  },
  // External play state control
  setPlayState: (state) => {
    if (videoPlayer.value && canPlay.value) {
      if (state === true || state === "play") {
        return videoPlayer.value.play();
      } else if (state === false || state === "pause") {
        videoPlayer.value.pause();
      } else if (state === "stop") {
        videoPlayer.value.pause();
        videoPlayer.value.currentTime = 0;
      } else if (state === "toggle") {
        togglePlay();
      }
    }
  },

  // Delayed autoplay method for external control
  delayedAutoplay: (delay = 5000) => {
    try {
      console.log("🎬 delayedAutoplay called with delay:", delay);

      if (autoStartTimer.value) {
        clearTimeout(autoStartTimer.value);
      }

      autoStartTimer.value = setTimeout(() => {
        if (canPlay.value && !isPlaying.value && !error.value) {
          console.log("🎬 Starting delayed autoplay");
          emit("update:isPlaying", true);
        } else {
          console.log("🎬 Cannot start delayed autoplay:", {
            canPlay: canPlay.value,
            isPlaying: isPlaying.value,
            hasError: !!error.value,
          });
        }
      }, delay);

      console.log("🎬 Delayed autoplay timer set for", delay, "ms");
    } catch (error) {
      console.error("🎬 Error in delayedAutoplay:", error);
    }
  },

  // Debug method to check available methods
  getAvailableMethods: () => {
    return {
      hasDelayedAutoplay: true,
      hasSetPlayState: true,
      hasTogglePlay: true,
      hasPlay: true,
      hasPause: true,
      componentReady: !!videoPlayer.value,
      canPlay: canPlay.value,
      isPlaying: isPlaying.value,
    };
  },

  // Safe delayed autoplay with fallback
  safeDelayedAutoplay: (delay = 5000) => {
    console.warn("🎬 Using safeDelayedAutoplay fallback");
    // Fallback: directly emit after delay
    setTimeout(() => {
      if (canPlay.value && !isPlaying.value && !error.value) {
        emit("update:isPlaying", true);
      }
    }, delay);
  },
});
</script>

<style scoped>
.custom-video-player {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-height: 200px; /* Ensure minimum height for consistent layout */
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
  min-height: 200px; /* Ensure minimum height for consistent layout */
}

video:hover {
  transform: scale(1.02);
}

/* Loading overlay improvements */
.loading-overlay {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(20, 20, 20, 0.9) 100%
  );
  backdrop-filter: blur(5px);
}

/* Error state styling */
.error-state {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(20, 20, 20, 0.95) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading spinner improvements */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>