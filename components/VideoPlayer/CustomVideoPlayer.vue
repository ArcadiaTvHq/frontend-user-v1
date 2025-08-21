<template>
  <div
    class="custom-video-player w-full h-full bg-black overflow-hidden relative"
  >
    <!-- Video Container -->
    <div class="relative w-full h-full">
      <video
        ref="videoPlayer"
        :src="useDirectUrl ? videoUrl : null"
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
        @progress="onProgress"
        @canplaythrough="onCanPlayThrough"
      >
        <!-- Fallback message -->
        <p class="text-white text-center p-4">
          Your browser does not support this video format.
        </p>
      </video>

      <!-- Minimal Loading Indicator - Only show when actually buffering -->
      <div
        v-if="isBuffering && streamUrl"
        class="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-10"
      >
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Buffering...</span>
        </div>
      </div>

      <!-- Playback Session Status Overlay -->
      <!-- <div
        v-if="isSessionActive && showSessionStatus"
        class="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm z-20"
      >
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              isTokenExpiringSoon ? 'bg-yellow-500' : 'bg-green-500',
            ]"
          ></div>
          <span>{{
            isTokenExpiringSoon ? "Token Expiring Soon" : "Session Active"
          }}</span>
        </div>
        <div class="text-xs text-gray-300 mt-1">
          Expires in {{ Math.floor(tokenExpiresIn / 60) }}:{{
            (tokenExpiresIn % 60).toString().padStart(2, "0")
          }}
        </div>
      </div> -->

      <!-- Advert Overlay -->
      <AdvertOverlay
        :show="showAdvertOverlay"
        :advert="currentAdvert"
        :skip-delay="5"
        @close="onAdvertClose"
        @skip="onAdvertSkip"
        @visit="onAdvertVisit"
      />

      <!-- Error Overlay -->
      <div
        v-if="error && !isLoading"
        class="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-30"
      >
        <div class="text-center max-w-md mx-auto p-6">
          <div class="error-icon mb-4">
            <svg
              class="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Playback Error</h3>
          <p class="text-gray-300 mb-6 leading-relaxed">{{ error.message }}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="retryPlayback"
              class="retry-button inline-flex items-center px-4 py-2 bg-[#FFD005] hover:bg-[#CE8F00] text-black font-medium rounded-lg transition-colors duration-200"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </button>
            <button
              @click="resetError"
              class="reset-button inline-flex items-center px-4 py-2 bg-transparent hover:bg-white hover:bg-opacity-10 text-white font-medium rounded-lg border border-white border-opacity-30 transition-all duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { buildImageUrl, preloadImage } from "~/src/utils/helpers";
import { usePlaybackSession } from "~/composables/usePlaybackSession.js";
import Hls from "hls.js";
import AdvertOverlay from "~/components/AdvertOverlay/AdvertOverlay.vue";
import { useAdvertStore } from "~/stores/adverts";
import { AdvertService } from "~/api/services/advert.service";

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
  muted: { type: Boolean, default: false },
  controls: { type: Boolean, default: true },
  preload: { type: String, default: "auto" },
  loop: { type: Boolean, default: true },
  volume: { type: Number, default: 1.0 },
  showLoading: { type: Boolean, default: true },
  showSessionStatus: { type: Boolean, default: true },
  // New prop for direct video URL (non-expiring Cloudflare HLS)
  videoUrl: {
    type: String,
    default: null,
  },
  // Flag to indicate if using direct URL instead of session-based
  useDirectUrl: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "ready",
  "error",
  "videoStarted",
  "videoPaused",
  "videoEnded",
  "timeUpdate",
  "sessionStarted",
  "sessionStopped",
  "tokenRefreshed",
]);

// Playback session composable
const {
  currentSession,
  isSessionActive,
  isLoading: sessionLoading,
  error: sessionError,
  stats,
  sessionDuration,
  tokenExpiresIn,
  isTokenExpiringSoon,
  isTokenValid,
  startPlayback,
  updatePlayback,
  stopPlayback,
  autoUpdateVideoUrl,
  sendHeartbeat: composableSendHeartbeat,
} = usePlaybackSession();

// Advert store
const advertStore = useAdvertStore();

// Reactive state
const videoPlayer = ref(null);
const streamUrl = ref(null);
const isLoading = ref(true);
// Loading message removed - simplified loading experience
const error = ref(null);
const isPlaying = ref(false);
const isBuffering = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progressPercent = ref(0);
const bufferedPercent = ref(0);
const lastEmittedSecond = ref(-1);
const canPlay = ref(false);

// Buffer monitoring variables
let lastBufferingLog = null;
let canPlayThroughLogged = false;
let isPauseDueToBuffering = false; // Track if pause is due to buffering

// Smart error management variables
let lastErrorTime = 0;
let errorRetryCount = 0;
let maxErrorRetries = 3;
let errorRetryDelay = 2000;
let isHandlingError = false;

// Advert state
const showAdvertOverlay = ref(false);
const currentAdvert = ref(null);
const hasShownBeginningAd = ref(false);

// Simplified advert flow: show beginning ads immediately when video loads
onMounted(() => {
  // Small delay to ensure everything is initialized
  setTimeout(() => {
    if (advertStore.adverts && advertStore.adverts.length > 0) {
      // Video loaded, showing beginning advert immediately
      showBeginningAdvert();
    } else {
      // No adverts available, starting main video directly
      // Start main video if no ads
      if (videoPlayer.value && videoPlayer.value.paused) {
        // Double-check that no advert overlay is active
        if (!showAdvertOverlay.value) {
          safePlay(false, "high").catch((err) => {
            // Failed to start main video
          });
        } else {
          // Advert overlay still active, waiting for completion
        }
      }
    }
  }, 1000); // 1 second delay to ensure video player is ready
});

// HLS instance
let hlsInstance = null;

// Advanced playback session management
let heartbeatInterval = null;
let tokenRefreshInterval = null;

// Advanced playback state coordination system
let playbackState = "playing"; // 'playing', 'paused', 'resuming', 'pausing'
let isManualResume = false;
let resumeCooldown = false;

// Unified playback control system
let playbackQueue = [];
let isProcessingPlayback = false;
let lastPlaybackAction = 0;
let playbackActionCooldown = 500; // Minimum 500ms between actions

// Proactive buffer monitoring system
let bufferMonitorInterval = null;
let lastQualityLevel = -1;
let bufferWarningShown = false;
let bufferCriticalShown = false;
let isBufferRebuilding = false;
let bufferRebuildTimer = null;

// Pre-buffering system for seamless token refresh
let isPreloading = false;
let preloadBufferReady = false;
let preloadUrl = null;
let preloadExpiry = null;
let preloadHls = null;
let isStreamReady = false;
let isSourceSwitching = false;

// Optimized buffering settings for smoother playback
const MIN_BUFFER_LENGTH = 8; // Reduced from 15s for faster start
const TARGET_BUFFER_LENGTH = 20; // Reduced from 30s for better responsiveness

// Enhanced network optimization settings
const NETWORK_OPTIMIZATION = {
  // Adaptive buffering based on network conditions
  adaptiveBufferLength: true,
  minBufferLength: 5, // Reduced for faster start
  maxBufferLength: 45, // Reduced for better responsiveness

  // Quality adaptation
  enableQualityAdaptation: true,
  qualitySwitchThreshold: 0.7, // 70% buffer before quality increase
  qualityDropThreshold: 0.4, // 40% buffer before quality decrease

  // Network resilience
  maxRetryAttempts: 2, // Reduced to prevent excessive retries
  retryDelay: 1500, // Faster retry
  networkTimeout: 8000, // Faster timeout

  // Buffer management
  aggressiveBufferManagement: false, // Disabled to prevent excessive pausing
  bufferRebuildThreshold: 0.15, // Rebuild buffer if below 15%

  // Proactive buffer monitoring
  proactiveBufferMonitoring: true,
  criticalBufferThreshold: 6, // Critical buffer level (seconds) - reduced
  warningBufferThreshold: 10, // Warning buffer level (seconds) - reduced
  qualityReductionThreshold: 8, // Reduce quality when buffer < 8s
  bufferCheckInterval: 2000, // Check buffer every 2 seconds - less frequent
};

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Smart error management functions
const showPlaybackError = (message, errorType) => {
  console.log(`🚨 Playback error (${errorType}): ${message}`);

  // Show error screen for user-facing errors
  if (errorType === "CONTENT_NOT_FOUND" || errorType === "UNKNOWN_ERROR") {
    error.value = {
      code: errorType,
      message: message,
      fatal: true,
    };
  }
};

const handlePlaybackUpdate = async (
  errorType,
  shouldContinueAtPosition = true
) => {
  if (isHandlingError) {
    console.log("⚠️ Already handling error, skipping duplicate request");
    return;
  }

  isHandlingError = true;
  const currentTime = videoPlayer.value?.currentTime || 0;
  const wasPlaying = !videoPlayer.value?.paused;

  console.log(`🔄 Handling ${errorType} - updating playback session...`);
  console.log(
    `📍 Current position: ${currentTime.toFixed(
      2
    )}s, was playing: ${wasPlaying}`
  );

  try {
    // Update playback session to get new token/URL
    if (!props.useDirectUrl) {
      await updatePlayback(props.contentId);
      console.log("✅ Playback session updated successfully");

      // Resume at current position if requested
      if (shouldContinueAtPosition && wasPlaying) {
        console.log("🔄 Resuming playback at current position...");
        setTimeout(() => {
          if (videoPlayer.value && videoPlayer.value.paused) {
            safePlay(false, "high").catch((err) => {
              console.warn("Failed to resume after error recovery:", err);
            });
          }
        }, 500);
      }
    } else {
      console.log("⚠️ Direct URL mode - cannot update playback session");
      showPlaybackError(
        "Cannot recover from error in direct URL mode.",
        "DIRECT_URL_ERROR"
      );
    }
  } catch (error) {
    console.error(`❌ Failed to handle ${errorType}:`, error);

    // Increment retry count
    errorRetryCount++;

    if (errorRetryCount <= maxErrorRetries) {
      console.log(
        `🔄 Retrying error recovery (${errorRetryCount}/${maxErrorRetries})...`
      );
      setTimeout(() => {
        handlePlaybackUpdate(errorType, shouldContinueAtPosition);
      }, errorRetryDelay * errorRetryCount);
    } else {
      console.log("❌ Max error retries exceeded - showing error screen");
      showPlaybackError(
        "Failed to recover from playback error. Please try again later.",
        "MAX_RETRIES_EXCEEDED"
      );
      errorRetryCount = 0; // Reset for next error
    }
  } finally {
    isHandlingError = false;
  }
};

const resetErrorState = () => {
  errorRetryCount = 0;
  lastErrorTime = 0;
  isHandlingError = false;
  error.value = null;
};

// Coordinated playback control system
const coordinatedPlay = () => {
  if (playbackState === "resuming" || resumeCooldown) {
    console.log("Playback resumption already in progress - skipping");
    return Promise.resolve();
  }

  playbackState = "resuming";
  isManualResume = true;

  console.log("Coordinated play request initiated");

  return videoPlayer.value
    .play()
    .then(() => {
      console.log("Coordinated play successful");
      playbackState = "playing";
      isManualResume = false;
      return Promise.resolve();
    })
    .catch((error) => {
      console.log(`Coordinated play failed: ${error.message}`);
      playbackState = "paused";
      isManualResume = false;
      return Promise.reject(error);
    });
};

const coordinatedPause = () => {
  if (playbackState === "pausing" || playbackState === "paused") {
    console.log(
      "Playback pause already in progress or already paused - skipping"
    );
    return;
  }

  playbackState = "pausing";
  console.log("Coordinated pause request initiated");

  videoPlayer.value.pause();
  playbackState = "paused";
  console.log("Coordinated pause completed");
};

const isPlaybackStable = () => {
  return playbackState === "playing" && !isManualResume && !resumeCooldown;
};

const isPlaybackResumable = () => {
  return playbackState === "paused" && !isManualResume && !resumeCooldown;
};

const setResumeCooldown = (duration = 2000) => {
  resumeCooldown = true;
  console.log(`Setting resume cooldown for ${duration}ms`);
  setTimeout(() => {
    resumeCooldown = false;
    console.log("Resume cooldown expired");
  }, duration);
};

// UNIFIED PLAYBACK CONTROL SYSTEM
const queuePlaybackAction = (action, priority = "normal") => {
  const now = Date.now();
  const timeSinceLastAction = now - lastPlaybackAction;

  // If we're still in cooldown, skip this action
  if (timeSinceLastAction < playbackActionCooldown) {
    console.log(
      `Skipping playback action - cooldown active (${timeSinceLastAction}ms < ${playbackActionCooldown}ms)`
    );
    return Promise.resolve();
  }

  // Add to queue with priority
  const queueItem = {
    action,
    priority,
    timestamp: now,
    id: Math.random().toString(36).substr(2, 9),
  };

  if (priority === "high") {
    playbackQueue.unshift(queueItem); // High priority goes to front
  } else {
    playbackQueue.push(queueItem); // Normal priority goes to back
  }

  console.log(
    `Queued playback action: ${action.type} (priority: ${priority}, queue length: ${playbackQueue.length})`
  );

  // Process queue if not already processing
  if (!isProcessingPlayback) {
    processPlaybackQueue();
  }

  return new Promise((resolve, reject) => {
    queueItem.resolve = resolve;
    queueItem.reject = reject;
  });
};

const processPlaybackQueue = async () => {
  if (isProcessingPlayback || playbackQueue.length === 0) {
    return;
  }

  isProcessingPlayback = true;

  while (playbackQueue.length > 0) {
    const item = playbackQueue.shift();

    try {
      console.log(`Processing playback action: ${item.action.type}`);

      // Execute the action
      const result = await executePlaybackAction(item.action);

      // Update last action timestamp
      lastPlaybackAction = Date.now();

      // Resolve the promise
      if (item.resolve) {
        item.resolve(result);
      }

      console.log(`Playback action completed: ${item.action.type}`);

      // Wait for cooldown before next action
      await new Promise((resolve) =>
        setTimeout(resolve, playbackActionCooldown)
      );
    } catch (error) {
      console.log(
        `Playback action failed: ${item.action.type} - ${error.message}`
      );

      // Reject the promise
      if (item.reject) {
        item.reject(error);
      }
    }
  }

  isProcessingPlayback = false;
  console.log("Playback queue processing completed");
};

const executePlaybackAction = async (action) => {
  switch (action.type) {
    case "play":
      if (playbackState === "resuming" || resumeCooldown) {
        console.log(
          "⏸️ Playback resumption already in progress, skipping duplicate request"
        );
        return Promise.resolve(); // Return resolved promise instead of throwing error
      }

      playbackState = "resuming";
      isManualResume = action.manual || false;

      console.log(`Executing play action (manual: ${action.manual})`);

      try {
        const result = await videoPlayer.value.play();
        playbackState = "playing";
        isManualResume = false;
        return result;
      } catch (error) {
        playbackState = "paused"; // Reset state on error
        isManualResume = false;
        throw error;
      }

    case "pause":
      if (playbackState === "pausing" || playbackState === "paused") {
        console.log("Pause already in progress or already paused - skipping");
        return;
      }

      playbackState = "pausing";
      console.log("Executing pause action");

      videoPlayer.value.pause();
      playbackState = "paused";

      return;

    default:
      throw new Error(`Unknown playback action: ${action.type}`);
  }
};

// Simplified playback control functions
const safePlay = (manual = false, priority = "normal") => {
  return queuePlaybackAction({ type: "play", manual }, priority);
};

const safePause = (priority = "normal") => {
  return queuePlaybackAction({ type: "pause" }, priority);
};

// Helper function to calculate buffered percentage
const calculateBufferedPercent = () => {
  if (!videoPlayer.value) return 0;

  // Get actual buffered ranges from video element
  const buffered = videoPlayer.value.buffered;
  if (buffered.length === 0) return 0;

  const duration = videoPlayer.value.duration || 0;
  if (duration === 0) return 0;

  // Calculate total buffered time
  let bufferedTime = 0;
  for (let i = 0; i < buffered.length; i++) {
    bufferedTime += buffered.end(i) - buffered.start(i);
  }

  // Return percentage of video that's buffered
  return Math.round((bufferedTime / duration) * 100);
};

// Playback session heartbeat and token refresh functions
//
// API Endpoints:
// - /start-playback: Starts a new session (called once)
// - /update-playback: Gets a new token (called every 4 minutes 30 seconds)
// - /heartbeat: Keeps session alive (called every minute)
//
const sendHeartbeat = async () => {
  if (!isSessionActive.value || !props.contentId) return;

  try {
    // Send heartbeat to keep session alive using the composable's function
    console.log("💓 Sending heartbeat for content:", props.contentId);

    // Call the composable's sendHeartbeat function which calls /heartbeat API
    // This keeps the session alive WITHOUT refreshing the token
    await composableSendHeartbeat(props.contentId);

    // Check if token is expiring soon and refresh if needed
    if (isTokenExpiringSoon.value) {
      console.log("⚠️ Token expiring soon, refreshing playback session...");
      await updatePlayback(props.contentId);
      emit("tokenRefreshed");
    }
  } catch (err) {
    console.warn("⚠️ Heartbeat failed:", err);
  }
};

const startHeartbeat = () => {
  if (!props.contentId) return;

  // Clear existing interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  // Send heartbeat every 5 minutes (300 seconds)
  heartbeatInterval = setInterval(() => {
    sendHeartbeat();
  }, 300000);

  console.log("💓 Started heartbeat (every 5 minutes)");
};

const startTokenRefresh = () => {
  if (!props.contentId) return;

  // Clear existing interval
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  // Get new token every 13 minutes (780 seconds) for proactive switching
  // This ensures we always have a fresh URL before the old one expires
  tokenRefreshInterval = setInterval(async () => {
    if (isSessionActive.value) {
      console.log("🔄 Proactive token refresh triggered (every 13 minutes)");
      try {
        // Start pre-buffering for seamless transition (background process)
        if (!isPreloading && !preloadBufferReady) {
          console.log("🔄 Starting pre-buffering for seamless token refresh");
          startPreBuffering();
        }

        // Call /update-playback API to get a new token immediately
        const response = await updatePlayback(props.contentId);
        emit("tokenRefreshed");

        // ALWAYS switch to new URL immediately when response is received
        if (response && response.token) {
          console.log(
            "🔄 New token received, switching immediately:",
            response.token.substring(0, 50) + "..."
          );

          // Store current playback state
          const currentTime = videoPlayer.value.currentTime;
          const wasPlaying = !videoPlayer.value.paused;
          const currentVolume = videoPlayer.value.volume;
          const currentPlaybackRate = videoPlayer.value.playbackRate;

          console.log(
            "🔄 Preserving state: time=" +
              currentTime.toFixed(2) +
              "s, playing=" +
              wasPlaying
          );

          // Switch to new stream immediately using the new token
          await switchToNewStream(
            response.token,
            currentTime,
            wasPlaying,
            currentVolume,
            currentPlaybackRate
          );

          // Update the session with new token for future reference
          if (currentSession.value) {
            currentSession.value.token = response.token;
            currentSession.value.expires_at =
              response.expires_at || response.expires_in_seconds;
          }

          console.log("✅ URL switched successfully to new token");
        } else {
          console.warn("⚠️ No token found in update-playback response");
        }
      } catch (err) {
        console.error("❌ Failed to refresh token:", err);
      }
    }
  }, 780000); // 13 minutes

  console.log("🔄 Started proactive token refresh (every 13 minutes)");
};

// Smart token refresh with adaptive timing
const startSmartTokenRefresh = () => {
  if (!props.contentId) return;

  // Clear existing interval
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  // Smart token refresh: every 13 minutes with immediate switching
  tokenRefreshInterval = setInterval(async () => {
    if (isSessionActive.value) {
      console.log("🔄 Smart token refresh triggered (every 13 minutes)");
      try {
        // Start pre-buffering for seamless transition (background process)
        if (!isPreloading && !preloadBufferReady) {
          console.log("🔄 Starting pre-buffering for seamless token refresh");
          startPreBuffering();
        }

        // Call /update-playback API to get a new token
        const response = await updatePlayback(props.contentId);
        emit("tokenRefreshed");

        // ALWAYS switch to new URL immediately when response is received
        if (response && response.token) {
          console.log(
            "🔄 New token received, switching immediately:",
            response.token.substring(0, 50) + "..."
          );

          // Store current playback state
          const currentTime = videoPlayer.value.currentTime;
          const wasPlaying = !videoPlayer.value.paused;
          const currentVolume = videoPlayer.value.volume;
          const currentPlaybackRate = videoPlayer.value.playbackRate;

          console.log(
            "🔄 Preserving state: time=" +
              currentTime.toFixed(2) +
              "s, playing=" +
              wasPlaying
          );

          // Switch to new stream immediately using the new token
          await switchToNewStream(
            response.token,
            currentTime,
            wasPlaying,
            currentVolume,
            currentPlaybackRate
          );

          // Update the session with new token for future reference
          if (currentSession.value) {
            currentSession.value.token = response.token;
            currentSession.value.expires_at =
              response.expires_at || response.expires_in_seconds;
          }

          console.log("✅ URL switched successfully to new token");
        } else {
          console.warn("⚠️ No token found in update-playback response");
        }
      } catch (err) {
        console.error("❌ Failed to refresh token:", err);
      }
    }
  }, 780000); // 13 minutes

  console.log("🔄 Started smart token refresh (every 13 minutes)");
};

// Loading message is no longer needed - simplified loading experience

// Event handlers
const onCanPlay = () => {
  canPlay.value = true;
  isLoading.value = false;

  // Reset error state when video can play
  resetErrorState();

  // Force a buffering check when video can play
  bufferedPercent.value = calculateBufferedPercent();

  // Start periodic buffering check
  startBufferingCheck();

  // Ensure video is unmuted for perfect viewing experience
  if (videoPlayer.value && props.muted === false) {
    videoPlayer.value.muted = false;
    // Video unmuted for perfect viewing experience
  }

  // Auto-play immediately when video can play using coordinated system
  if (props.autoplay && !isPlaying.value) {
    safePlay(false, "high").catch((err) => {
      console.warn("Auto-play failed:", err);
    });
  }

  emit("ready");
};

const onPlaying = () => {
  console.log("▶️ Video is playing");
  isPlaying.value = true;
  isBuffering.value = false;

  // Reset buffering pause flag when playback resumes
  if (isPauseDueToBuffering) {
    console.log("🔄 Resetting buffering pause flag - playback resumed");
    isPauseDueToBuffering = false;
  }
};

const onWaiting = () => {
  // Only log buffering if it's been more than 2 seconds since last log
  const now = Date.now();
  if (!lastBufferingLog || now - lastBufferingLog > 2000) {
    console.log("⏳ Video is waiting/buffering");
    lastBufferingLog = now;
  }
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
  let errorType = "UNKNOWN";

  switch (errorCode) {
    case 1:
      errorMessage = "Video loading was aborted. Please try again.";
      errorType = "ABORTED";
      break;
    case 2:
      errorMessage =
        "Network error occurred while loading video. Please check your connection.";
      errorType = "NETWORK";
      break;
    case 3:
      errorMessage =
        "Video decoding failed. This video format may not be supported.";
      errorType = "DECODE";
      break;
    case 4:
      errorMessage = "Video format is not supported by your browser.";
      errorType = "FORMAT";
      break;
    default:
      errorMessage = "An unexpected error occurred while playing the video.";
      errorType = "UNKNOWN";
  }

  // Enhanced error object with more context
  const enhancedError = {
    code: errorCode,
    message: errorMessage,
    type: errorType,
    timestamp: new Date().toISOString(),
    videoSrc: video.src,
    currentSrc: video.currentSrc,
    networkState: video.networkState,
    readyState: video.readyState,
    error: video.error,
  };

  error.value = enhancedError;
  emit("error", enhancedError);

  // Log detailed error for debugging
  console.error("Enhanced video error:", enhancedError);
};

// Retry playback functionality
const retryPlayback = async () => {
  console.log("🔄 Retrying playback...");

  try {
    // Reset error state
    error.value = null;
    isLoading.value = true;

    // Check if we need to update the playback session first
    if (props.contentId && isSessionActive.value) {
      console.log(
        "🔄 Checking if playback session needs update before retry..."
      );
      try {
        await updatePlayback(props.contentId);
        console.log("✅ Playback session updated successfully");
      } catch (sessionError) {
        console.warn(
          "⚠️ Failed to update playback session, continuing with retry:",
          sessionError
        );
      }
    }

    // Reset video player
    if (videoPlayer.value) {
      videoPlayer.value.currentTime = 0;
      videoPlayer.value.load();
    }

    // Reinitialize streaming
    await initializeStreaming();

    console.log("✅ Playback retry successful");
  } catch (retryError) {
    console.error("❌ Playback retry failed:", retryError);

    // Check if it's an authentication error
    if (retryError.message && retryError.message.includes("401")) {
      error.value = {
        code: "AUTH_ERROR",
        message:
          "Authentication failed. Please refresh the page and try again.",
        type: "AUTH",
        timestamp: new Date().toISOString(),
        originalError: retryError.message,
      };
    } else {
      error.value = {
        code: "RETRY_FAILED",
        message: "Failed to retry playback. Please refresh the page.",
        type: "RETRY",
        timestamp: new Date().toISOString(),
        originalError: retryError.message,
      };
    }
  } finally {
    isLoading.value = false;
  }
};

// Reset error state
const resetError = () => {
  console.log("🔄 Resetting error state...");
  error.value = null;
};

// Handle HLS 401/403 errors by updating playback session and retrying
const handleHls401Error = async () => {
  console.log("🔐 Handling HLS 401/403 error - updating playback session...");

  try {
    // Show loading state
    isLoading.value = true;

    // Update the playback session to get a new token
    if (props.contentId && isSessionActive.value) {
      console.log("🔄 Updating playback session for new token...");
      await updatePlayback(props.contentId);

      // Wait a moment for the token to be updated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reinitialize streaming with new token
      console.log("🔄 Reinitializing streaming with new token...");
      await initializeStreaming();

      console.log("✅ Successfully recovered from 401/403 error");

      // Clear any existing errors
      error.value = null;

      // Emit success event
      emit("tokenRefreshed");
    } else {
      console.warn(
        "⚠️ Cannot update playback session - no active session or content ID"
      );
      throw new Error("No active playback session to update");
    }
  } catch (error) {
    console.error("❌ Failed to handle HLS 401/403 error:", error);

    // Set error state for user to see
    error.value = {
      code: "AUTH_ERROR",
      message: "Authentication failed. Please refresh the page and try again.",
      type: "AUTH",
      timestamp: new Date().toISOString(),
      originalError: error.message,
    };

    // Emit error for parent component
    emit("error", error.value);
  } finally {
    isLoading.value = false;
  }
};

const handlePlay = () => {
  isPlaying.value = true;
  console.log("▶️ Play event triggered");
  emit("videoStarted");

  console.log("🎬 About to show beginning advert...");
  // Show beginning advert if not shown yet
  showBeginningAdvert();
};

const handlePause = () => {
  isPlaying.value = false;
  emit("videoPaused");

  console.log("⏸️ Pause event detected");

  // Check if pause is due to buffering
  if (isBuffering.value || isPauseDueToBuffering) {
    console.log("⏸️ Skipping pause advert - video paused due to buffering");
    return; // Don't show ads for buffering pauses
  }

  // Only show pause advert if beginning ads are not active and it's a user-initiated pause
  if (!showAdvertOverlay.value || hasShownBeginningAd.value) {
    console.log("⏸️ Showing pause advert - user-initiated pause");
    showPauseAdvert();
  } else {
    console.log("⏸️ Skipping pause advert - beginning ads are still active");
  }
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

  // Auto-play when video can play and autoplay is enabled using coordinated system
  if (canPlay.value && !isPlaying.value && props.autoplay) {
    console.log("🚀 Auto-playing video - canPlay:", canPlay.value);
    safePlay(false, "high").catch((err) => {
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

const onLoadedMetadata = () => {
  console.log("📋 Video metadata loaded");
  duration.value = videoPlayer.value.duration;

  // Check buffering when metadata is loaded
  bufferedPercent.value = calculateBufferedPercent();
};

const onProgress = () => {
  // Update buffering progress when new data is downloaded
  bufferedPercent.value = calculateBufferedPercent();
  // Buffering progress
};

const onCanPlayThrough = () => {
  // Only log once per session to reduce console spam
  if (!canPlayThroughLogged) {
    console.log("🎯 Video can play through without buffering");
    canPlayThroughLogged = true;
  }
  // Update buffering percentage one more time
  bufferedPercent.value = calculateBufferedPercent();
};

const handleVideoClick = () => {
  if (!props.controls) {
    togglePlay();
  }
};

// Advert methods
const showBeginningAdvert = () => {
  // showBeginningAdvert called

  // Check if advert store is available
  if (!advertStore) {
    // Advert store not available
    return;
  }

  // Adverts in store and beginning adverts

  if (hasShownBeginningAd.value) {
    // Beginning advert already shown, skipping
    return;
  }

  // Check if we have any adverts at all
  if (!advertStore.adverts || advertStore.adverts.length === 0) {
    // No adverts available in store, skipping beginning advert
    return;
  }

  // Use the beginningAdverts computed property directly since it already filters for video adverts with beginning position
  if (advertStore.beginningAdverts.length === 0) {
    // No beginning video adverts available
    return;
  }

  // Get a random advert from the already-filtered beginning adverts
  const beginningAdvert = AdvertService.getRandomAdvert(
    advertStore.beginningAdverts
  );
  // Selected beginning advert

  if (beginningAdvert) {
    // Ensure main video is paused before showing ads
    if (videoPlayer.value && !videoPlayer.value.paused) {
      // Pausing main video for beginning advert
      videoPlayer.value.pause();
    }

    currentAdvert.value = beginningAdvert;
    showAdvertOverlay.value = true;
    hasShownBeginningAd.value = true;

    // Beginning advert overlay shown - main video paused in background
  } else {
    // No beginning advert available
  }
};

const showPauseAdvert = () => {
  console.log("⏸️ showPauseAdvert called");

  // Prevent pause ads during beginning ads
  if (showAdvertOverlay.value && hasShownBeginningAd.value === false) {
    console.log("⏸️ Skipping pause advert - beginning ads are still active");
    return;
  }

  // Check if advert store is available
  if (!advertStore) {
    console.log("❌ Advert store not available");
    return;
  }

  console.log("🔍 Pause adverts:", advertStore.pauseAdverts);

  // Check if we have any adverts at all
  if (!advertStore.adverts || advertStore.adverts.length === 0) {
    console.log("📭 No adverts available in store, skipping pause advert");
    return;
  }

  // Use the pauseAdverts computed property directly since it already filters for image adverts
  if (advertStore.pauseAdverts.length === 0) {
    console.log(
      "📭 No pause image adverts available - video will remain paused"
    );
    // Don't return here - let the video stay paused
    return;
  }

  // Get a random advert from the already-filtered pause adverts
  const pauseAdvert = AdvertService.getRandomAdvert(advertStore.pauseAdverts);
  console.log("🎯 Selected pause advert:", pauseAdvert);

  if (pauseAdvert) {
    // Pause the main video before showing advert to prevent conflicts
    if (videoPlayer.value && !videoPlayer.value.paused) {
      console.log("⏸️ Pausing main video before showing pause advert");
      videoPlayer.value.pause();
    }

    currentAdvert.value = pauseAdvert;
    showAdvertOverlay.value = true;
    console.log("✅ Pause advert overlay shown");
  } else {
    console.log("❌ No pause advert available - video will remain paused");
  }
};

const onAdvertClose = () => {
  console.log(
    "🎬 onAdvertClose called - advert completed (manual close or natural completion)"
  );

  // Store the advert type before cleaning up (to determine behavior)
  const advertType = currentAdvert.value?.type;
  const isBeginningAd =
    !hasShownBeginningAd.value ||
    advertType === "short_video" ||
    advertType === "long_video";

  console.log("🎯 Advert type:", advertType, "Is beginning ad:", isBeginningAd);

  // Clean up advert state
  showAdvertOverlay.value = false;
  currentAdvert.value = null;

  // Reset playback state to allow starting the main video
  if (playbackState === "resuming" || playbackState === "playing") {
    console.log("🔄 Resetting playback state from", playbackState, "to paused");
    playbackState = "paused";
  }

  // Ensure advert state is fully cleaned up before proceeding
  nextTick(() => {
    if (isBeginningAd) {
      console.log(
        "🧹 Beginning advert state cleaned up, ready to start main video"
      );
    } else {
      console.log("🧹 Pause advert state cleaned up, video will remain paused");
    }
  });

  // Debug: Check video player state
  console.log("🔍 Video player state after reset:", {
    videoPlayerExists: !!videoPlayer.value,
    isPaused: videoPlayer.value?.paused,
    playbackState,
    isPlaying: isPlaying.value,
    canPlay: canPlay.value,
  });

  // Only start playing the main video for beginning ads, not pause ads
  if (isBeginningAd && videoPlayer.value && videoPlayer.value.paused) {
    console.log("▶️ Starting main video after beginning advert completion");

    // Check if video is ready to play
    if (!canPlay.value) {
      console.log("⏳ Video not ready to play yet, waiting...");
      // Wait for video to be ready
      const checkCanPlay = setInterval(() => {
        if (canPlay.value) {
          clearInterval(checkCanPlay);
          console.log("✅ Video is now ready, starting playback");
          startMainVideo();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkCanPlay);
        console.log("⏰ Timeout waiting for video to be ready, trying anyway");
        startMainVideo();
      }, 5000);
      return;
    }

    // Video is ready, start it
    startMainVideo();
  } else if (!isBeginningAd) {
    console.log(
      "⏸️ Pause advert closed - video will remain paused as expected"
    );
  } else {
    console.log("⚠️ Cannot start main video:", {
      videoPlayerExists: !!videoPlayer.value,
      isPaused: videoPlayer.value?.paused,
    });
  }

  // Helper function to start main video
  function startMainVideo() {
    console.log("🚀 Calling safePlay to start main video");

    // Debug: Check current state
    console.log("🔍 Current state before starting:", {
      videoPlayerExists: !!videoPlayer.value,
      isPaused: videoPlayer.value?.paused,
      playbackState,
      isPlaying: isPlaying.value,
      canPlay: canPlay.value,
      isLoading: isLoading.value,
    });

    // Try safePlay first
    safePlay(false, "high")
      .then(() => {
        console.log("✅ Main video started successfully after advert");
      })
      .catch((err) => {
        console.error("❌ safePlay failed, trying direct play:", err);

        // Fallback: try direct play
        if (videoPlayer.value && videoPlayer.value.paused) {
          videoPlayer.value
            .play()
            .then(() => {
              console.log("✅ Main video started with direct play");
            })
            .catch((directError) => {
              console.error("❌ Direct play also failed:", directError);
            });
        }
      });
  }
};

const onAdvertSkip = () => {
  console.log("🎬 onAdvertSkip called - advert skipped");

  // Store the advert type before cleaning up (to determine behavior)
  const advertType = currentAdvert.value?.type;
  const isBeginningAd =
    !hasShownBeginningAd.value ||
    advertType === "short_video" ||
    advertType === "long_video";

  console.log("🎯 Advert type:", advertType, "Is beginning ad:", isBeginningAd);

  showAdvertOverlay.value = false;
  currentAdvert.value = null;

  // Reset playback state to allow starting the main video
  if (playbackState === "resuming" || playbackState === "playing") {
    console.log("🔄 Resetting playback state from", playbackState, "to paused");
    playbackState = "paused";
  }

  // Only start playing the main video for beginning ads, not pause ads
  if (isBeginningAd && videoPlayer.value && videoPlayer.value.paused) {
    console.log("▶️ Starting main video after beginning advert skip");

    // Start the main video
    safePlay(false, "high")
      .then(() => {
        console.log("✅ Main video started successfully after advert skip");
      })
      .catch((err) => {
        console.error("❌ Failed to start main video after advert skip:", err);
      });
  } else if (!isBeginningAd) {
    console.log(
      "⏸️ Pause advert skipped - video will remain paused as expected"
    );
  }
};

const onAdvertVisit = () => {
  console.log("🎬 onAdvertVisit called - advert visited");

  // Store the advert type before cleaning up (to determine behavior)
  const advertType = currentAdvert.value?.type;
  const isBeginningAd =
    !hasShownBeginningAd.value ||
    advertType === "short_video" ||
    advertType === "long_video";

  console.log("🎯 Advert type:", advertType, "Is beginning ad:", isBeginningAd);

  // Advert was clicked, close overlay
  showAdvertOverlay.value = false;
  currentAdvert.value = null;

  // Reset playback state to allow starting the main video
  if (playbackState === "resuming" || playbackState === "playing") {
    console.log("🔄 Resetting playback state from", playbackState, "to paused");
    playbackState = "paused";
  }

  // Only start playing the main video for beginning ads, not pause ads
  if (isBeginningAd && videoPlayer.value && videoPlayer.value.paused) {
    console.log("▶️ Starting main video after beginning advert visit");

    // Start the main video
    safePlay(false, "high")
      .then(() => {
        console.log("✅ Main video started successfully after advert visit");
      })
      .catch((err) => {
        console.error("❌ Failed to start main video after advert visit:", err);
      });
  } else if (!isBeginningAd) {
    console.log(
      "⏸️ Pause advert visited - video will remain paused as expected"
    );
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

// Start buffering function
const startBuffering = () => {
  if (!videoPlayer.value) return;

  // Starting buffering

  // Set a small buffer ahead target to start buffering immediately
  if (videoPlayer.value.buffered.length > 0) {
    const currentTime = videoPlayer.value.currentTime || 0;
    const bufferedEnd = videoPlayer.value.buffered.end(
      videoPlayer.value.buffered.length - 1
    );

    // If we have buffered content ahead, start buffering more
    if (bufferedEnd > currentTime) {
      console.log("📦 Buffering ahead from current position");
      // The browser will automatically start buffering more content
    }
  }

  // Force a buffering check
  bufferedPercent.value = calculateBufferedPercent();
};

// Advanced buffer monitoring and pre-buffering functions
const startProactiveBufferMonitoring = () => {
  if (bufferMonitorInterval) {
    clearInterval(bufferMonitorInterval);
  }

  if (!NETWORK_OPTIMIZATION.proactiveBufferMonitoring) {
    return;
  }

  // Starting proactive buffer monitoring

  bufferMonitorInterval = setInterval(() => {
    if (
      !hlsInstance ||
      !hlsInstance.media ||
      isSourceSwitching ||
      isBufferRebuilding
    ) {
      return; // Skip monitoring during source switches or buffer rebuilding
    }

    // Only skip monitoring during active resumption, not during stable playback
    if (playbackState === "resuming") {
      return; // Skip monitoring during active playback resumption
    }

    const currentBuffer = getCurrentBufferLength();
    const criticalThreshold = NETWORK_OPTIMIZATION.criticalBufferThreshold;
    const warningThreshold = NETWORK_OPTIMIZATION.warningBufferThreshold;
    const qualityThreshold = NETWORK_OPTIMIZATION.qualityReductionThreshold;

    // CRITICAL: Buffer below 10 seconds - immediate action required
    if (currentBuffer < criticalThreshold) {
      if (!bufferCriticalShown) {
        bufferCriticalShown = true;
      }

      // Immediate quality reduction to lowest level
      reduceQualityToLowest();

      // Pause playback temporarily to rebuild buffer ONLY if not already rebuilding
      if (
        !videoPlayer.value.paused &&
        currentBuffer < 5 &&
        !isBufferRebuilding &&
        playbackState === "playing"
      ) {
        console.log("Buffer critically low - pausing to rebuild");
        isBufferRebuilding = true;

        // Mark as buffering pause to prevent ad triggers
        isBuffering.value = true;
        isPauseDueToBuffering = true; // Set flag to prevent pause ads

        safePause("high"); // High priority pause

        // Clear any existing rebuild timer
        if (bufferRebuildTimer) {
          clearTimeout(bufferRebuildTimer);
        }

        // Start buffer rebuilding process
        startBufferRebuilding();
      }
    }
    // WARNING: Buffer below 15 seconds - reduce quality
    else if (currentBuffer < warningThreshold) {
      if (!bufferWarningShown) {
        bufferWarningShown = true;
      }

      // Reduce quality when buffer gets low
      if (currentBuffer < qualityThreshold) {
        reduceQualityByOne();
      }
    }
    // Buffer is healthy - can increase quality
    else {
      // Reset warning flags
      if (bufferWarningShown || bufferCriticalShown) {
        bufferWarningShown = false;
        bufferCriticalShown = false;
      }

      // Gradually increase quality if buffer is stable
      if (currentBuffer > warningThreshold + 10) {
        increaseQualityGradually();
      }
    }
  }, NETWORK_OPTIMIZATION.bufferCheckInterval);
};

const startBufferRebuilding = () => {
  console.log("Starting buffer rebuilding process...");

  // Monitor buffer growth during rebuilding
  const rebuildCheckInterval = setInterval(() => {
    const currentBuffer = getCurrentBufferLength();
    const targetBuffer = NETWORK_OPTIMIZATION.criticalBufferThreshold;

    console.log(
      `Buffer rebuilding: ${currentBuffer.toFixed(
        1
      )}s / ${targetBuffer}s target`
    );

    if (currentBuffer >= targetBuffer) {
      // Buffer is sufficient, resume playback
      clearInterval(rebuildCheckInterval);
      resumePlaybackAfterRebuild();
    }
  }, 500); // Check every 500ms during rebuilding

  // Set a maximum rebuild time to prevent infinite waiting
  bufferRebuildTimer = setTimeout(() => {
    clearInterval(rebuildCheckInterval);
    console.log("⚠️ Buffer rebuild timeout - resuming with available buffer");
    resumePlaybackAfterRebuild();
  }, 8000); // Reduced from 10s to 8s for faster recovery
};

const resumePlaybackAfterRebuild = () => {
  if (!isBufferRebuilding) return;

  const currentBuffer = getCurrentBufferLength();
  console.log(
    `Buffer rebuilt to ${currentBuffer.toFixed(1)}s - resuming playback`
  );

  // Reset rebuilding state
  isBufferRebuilding = false;
  bufferCriticalShown = false;

  // Reset buffering flags
  isBuffering.value = false;
  isPauseDueToBuffering = false;

  // Resume playback using unified system
  setTimeout(() => {
    if (
      videoPlayer.value.paused &&
      currentBuffer >= NETWORK_OPTIMIZATION.criticalBufferThreshold
    ) {
      console.log(
        "🔄 Attempting to auto-resume playback after buffer rebuild..."
      );

      // Use unified playback control for automatic resumption
      safePlay(false, "high")
        .then(() => {
          console.log("✅ Playback resumed successfully after buffer rebuild");
        })
        .catch((error) => {
          console.log(
            `❌ Failed to resume playback after buffer rebuild: ${error.message}`
          );
          // Retry with normal priority after a delay
          setTimeout(() => {
            if (videoPlayer.value.paused && playbackState === "paused") {
              console.log("🔄 Retrying auto-resume with normal priority...");
              safePlay(false, "normal").catch((e) =>
                console.log(`❌ Retry failed: ${e.message}`)
              );
            }
          }, 2000);
        });
    } else {
      console.log(
        "⚠️ Cannot auto-resume: video not paused or insufficient buffer"
      );
    }
  }, 100); // Reduced delay for faster resumption
};

const getCurrentBufferLength = () => {
  if (!hlsInstance || !hlsInstance.media || !hlsInstance.media.buffered) {
    return 0;
  }

  try {
    const buffered = hlsInstance.media.buffered;
    if (buffered.length === 0) return 0;

    const currentTime = hlsInstance.media.currentTime;
    let bufferLength = 0;

    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);

      if (currentTime >= start && currentTime < end) {
        bufferLength = end - currentTime;
        break;
      }
    }

    return bufferLength;
  } catch (error) {
    return 0;
  }
};

const reduceQualityToLowest = () => {
  if (!hlsInstance || !hlsInstance.levels || hlsInstance.levels.length === 0)
    return;

  const lowestLevel = hlsInstance.levels.length - 1;
  if (hlsInstance.currentLevel !== lowestLevel) {
    lastQualityLevel = hlsInstance.currentLevel;
    hlsInstance.currentLevel = lowestLevel;
    // Quality reduced to lowest level to preserve buffer
  }
};

const reduceQualityByOne = () => {
  if (!hlsInstance || !hlsInstance.levels || hlsInstance.levels.length === 0)
    return;

  const currentLevel = hlsInstance.currentLevel;
  if (currentLevel > 0) {
    lastQualityLevel = currentLevel;
    hlsInstance.currentLevel = currentLevel - 1;
    // Quality reduced by one level to preserve buffer
  }
};

const increaseQualityGradually = () => {
  if (!hlsInstance || !hlsInstance.levels || hlsInstance.levels.length === 0)
    return;

  const currentLevel = hlsInstance.currentLevel;
  const maxLevel = hlsInstance.levels.length - 1;

  // Only increase if we have room and buffer is stable
  if (
    currentLevel < maxLevel &&
    getCurrentBufferLength() > NETWORK_OPTIMIZATION.warningBufferThreshold + 15
  ) {
    hlsInstance.currentLevel = currentLevel + 1;
    // Quality increased by one level - buffer stable
  }
};

// Pre-buffering system for seamless token refresh
const startPreBuffering = async () => {
  if (isPreloading || preloadHls) {
    console.log("Pre-buffering already in progress");
    return;
  }

  try {
    isPreloading = true;
    console.log("Starting to pre-buffer next stream...");

    // Get new token for pre-buffering
    const res = await updatePlayback(props.contentId);
    if (!res) {
      throw new Error("Failed to get token for pre-buffering");
    }

    const newUrl = res.token;
    const newExpiry = parse_expiry(res);

    console.log(
      `Pre-buffering stream with token expiring at: ${new Date(
        newExpiry
      ).toISOString()}`
    );

    // Store for later use
    preloadUrl = newUrl;
    preloadExpiry = newExpiry;

    // Create HLS instance for pre-buffering
    preloadHls = new Hls({
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferHole: 0.1,
      lowLatencyMode: false,
      backBufferLength: 30,
      autoStartLoad: true,
      startLevel: -1,
      enableWorker: true,
    });

    // Load the stream and start buffering
    preloadHls.loadSource(newUrl);

    preloadHls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log(
        "Pre-buffer stream manifest parsed, starting background buffering..."
      );
      preloadHls.startLoad();
      monitorPreloadBuffer();
    });

    preloadHls.on(Hls.Events.LEVEL_LOADED, () => {
      console.log("Pre-buffer stream segments loaded");
    });

    preloadHls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.log(`Fatal error in pre-buffer stream: ${data.details}`);

        // Check if it's a 401/403 error in preload
        if (
          data.details === "FRAG_LOAD_ERROR" &&
          data.response &&
          (data.response.code === 401 || data.response.code === 403)
        ) {
          console.log(
            "🔐 401/403 error in preload stream - will retry with new token"
          );
          // Don't destroy preload HLS instance yet, let the main error handler deal with it
        } else {
          // Clean up failed preload for other fatal errors
          if (preloadHls) {
            preloadHls.destroy();
            preloadHls = null;
          }
          isPreloading = false;
          preloadBufferReady = false;
          isStreamReady = false;
        }
      }
    });
  } catch (error) {
    console.log(`Pre-buffering failed: ${error.message}`);
    isPreloading = false;
  }
};

const monitorPreloadBuffer = () => {
  if (!preloadHls) {
    console.log("Pre-buffering HLS instance not initialized.");
    return;
  }

  let consecutiveReadyChecks = 0;
  const requiredConsecutiveChecks = 3; // Must be ready 3 times in a row
  let lastBufferLength = 0;
  let stabilityChecks = 0;
  const maxStabilityChecks = 20; // Check stability over 2 seconds

  const checkBuffer = () => {
    if (!preloadHls.buffered || preloadHls.buffered.length === 0) {
      // No buffer yet, check again in 100ms
      setTimeout(checkBuffer, 100);
      return;
    }

    // Calculate current buffer length
    const currentTime = videoPlayer.value.currentTime;
    let bufferLength = 0;

    for (let i = 0; i < preloadHls.buffered.length; i++) {
      const start = preloadHls.buffered.start(i);
      const end = preloadHls.buffered.end(i);

      if (currentTime >= start && currentTime < end) {
        // Current time is within this buffer range
        bufferLength = end - currentTime;
        break;
      }
    }

    // Check if buffer is stable (not fluctuating)
    const bufferStable = Math.abs(bufferLength - lastBufferLength) < 0.5;
    lastBufferLength = bufferLength;

    if (bufferLength >= TARGET_BUFFER_LENGTH && bufferStable) {
      consecutiveReadyChecks++;
      console.log(
        `Pre-buffer stability check ${consecutiveReadyChecks}/${requiredConsecutiveChecks}`
      );

      if (consecutiveReadyChecks >= requiredConsecutiveChecks) {
        // Stream is truly ready - perform final readiness verification
        performFinalReadinessCheck();
        return;
      }
    } else {
      // Reset consecutive checks if buffer is unstable
      consecutiveReadyChecks = 0;
    }

    // Continue monitoring
    if (stabilityChecks < maxStabilityChecks) {
      stabilityChecks++;
      setTimeout(checkBuffer, 100);
    } else {
      console.log("Pre-buffer stability timeout reached");
      // Fallback: mark as ready if we have minimum buffer
      if (bufferLength >= MIN_BUFFER_LENGTH) {
        console.log("Fallback: Using minimum buffer for pre-buffer");
        performFinalReadinessCheck();
      }
    }
  };

  // Start checking buffer
  checkBuffer();
};

const performFinalReadinessCheck = () => {
  if (!preloadHls) return;

  console.log("Performing final readiness check for pre-buffered stream...");

  // Check multiple readiness criteria
  let readinessScore = 0;
  const maxReadinessScore = 5;

  // 1. Buffer length check
  if (preloadHls.buffered && preloadHls.buffered.length > 0) {
    readinessScore++;
  }

  // 2. Stream state check
  if (preloadHls.media && preloadHls.media.readyState >= 2) {
    readinessScore++;
  }

  // 3. HLS state check
  if (preloadHls.readyState === Hls.HlsState.READY) {
    readinessScore++;
  }

  // 4. Segment availability check
  if (preloadHls.levels && preloadHls.levels.length > 0) {
    readinessScore++;
  }

  // 5. Buffer stability check
  if (preloadHls.buffered && preloadHls.buffered.length > 0) {
    const bufferLength =
      preloadHls.buffered.end(0) - preloadHls.buffered.start(0);
    if (bufferLength >= TARGET_BUFFER_LENGTH) {
      readinessScore++;
    }
  }

  console.log(`Final readiness score: ${readinessScore}/${maxReadinessScore}`);

  if (readinessScore >= 4) {
    // Require 80% readiness
    console.log("Pre-buffered stream is fully ready for instant switching!");
    preloadBufferReady = true;
    isStreamReady = true;
    isPreloading = false;
  } else {
    console.log(
      "Pre-buffered stream not ready enough, continuing to monitor..."
    );
    // Continue monitoring
    setTimeout(() => monitorPreloadBuffer(), 200);
  }
};

const parse_expiry = (data) => {
  if (data.expires_at) {
    return Date.parse(data.expires_at);
  }
  if (data.expires_in_seconds) {
    return Date.now() + data.expires_in_seconds * 1000;
  }
  return Date.now() + 5 * 60 * 1000;
};

// --- Direct Video Initialization ---
const initializeDirectVideo = (url) => {
  if (!url || !videoPlayer.value) return;

  console.log("🎬 Initializing direct video with URL:", url);

  // Set the stream URL
  streamUrl.value = url;

  // For direct URLs, we can set the src directly on the video element
  // and let the browser handle HLS natively if supported
  if (videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")) {
    console.log("🔧 Using native HLS support");
    videoPlayer.value.src = url;
  } else {
    // Fallback to HLS.js for browsers without native HLS support
    console.log("🔧 Using HLS.js fallback");
    initializeHLS(url);
  }

  // Start buffering immediately
  startBuffering();
  startBufferingCheck();

  // Auto-play if enabled
  if (props.autoplay && !isPlaying.value) {
    safePlay(false, "high").catch((err) => {
      console.warn("Auto-play failed:", err);
    });
  }

  isLoading.value = false;
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
      // Optimized for smooth playback - reduced buffering for better responsiveness
      maxBufferLength: 20, // Reduced from 30s for faster start
      maxMaxBufferLength: 40, // Reduced from 60s for better responsiveness
      maxBufferSize: 40 * 1000 * 1000, // 40MB - reduced for faster loading
      maxBufferHole: 0.05, // Tighter buffer hole tolerance for smoother playback
      lowLatencyMode: false,
      backBufferLength: 15, // Reduced from 30s for better responsiveness

      // Performance optimizations
      enableWorker: true, // Use Web Workers for better performance
      startLevel: -1, // Auto quality selection

      // Adaptive Bitrate (ABR) optimizations for smoother streaming
      abrEwmaDefaultEstimate: 300000, // Reduced for faster adaptation
      abrBandWidthFactor: 0.9, // More conservative bandwidth usage
      abrBandWidthUpFactor: 0.6, // Slower quality increases to prevent buffering
      abrBandWidthDownFactor: 0.8, // Faster quality decreases when needed
      abrMaxWithRealBitrate: true, // Use real bitrate for ABR decisions

      // Buffer management - optimized for smooth playback
      maxStarvationDelay: 2, // Reduced from 4s for faster response
      maxLoadingDelay: 2, // Reduced from 4s for faster loading
      maxSeekHoleLength: 1, // Reduced from 2s for smoother seeking

      // Additional optimizations
      enableSoftwareAES: true, // Better encryption handling
      debug: false, // Disable debug logging for performance

      // Network resilience - balanced for smoothness
      maxFragLookUpTolerance: 0.1, // Reduced tolerance for better sync
      liveSyncDurationCount: 3, // Reduced live sync for faster start
      liveMaxLatencyDurationCount: 8, // Reduced max latency
    });

    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(videoPlayer.value);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      // HLS manifest loaded successfully
      // Start buffering immediately
      startBuffering();
      // Start periodic buffering check
      startBufferingCheck();
      // Start proactive buffer monitoring for smooth playback
      setTimeout(() => {
        startProactiveBufferMonitoring();
      }, 2000); // Start monitoring 2 seconds after manifest is ready

      // Main video is paused during beginning ads - no autoplay
      // Main video paused - waiting for beginning ads to complete
    });

    hlsInstance.on(Hls.Events.FRAG_LOADED, () => {
      // Update buffering progress when fragments are loaded
      bufferedPercent.value = calculateBufferedPercent();
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS.js error:", data);

      // Smart error management based on error type and response code
      if (data.fatal) {
        console.error("❌ Fatal HLS error:", data.details);

        // Handle different error types with appropriate recovery strategies
        if (data.details === "FRAG_LOAD_ERROR" && data.response) {
          const errorCode = data.response.code;

          if (errorCode === 401) {
            // 401 Unauthorized - token expired, update playback immediately
            console.log(
              "🔐 401 Unauthorized error - updating playback session immediately"
            );
            handlePlaybackUpdate("AUTH_EXPIRED", true);
          } else if (errorCode === 403) {
            // 403 Forbidden - access denied, update playback immediately
            console.log(
              "🚫 403 Forbidden error - updating playback session immediately"
            );
            handlePlaybackUpdate("ACCESS_DENIED", true);
          } else if (errorCode === 404) {
            // 404 Not Found - content not available, show error screen
            console.log("📭 404 Not Found error - showing error screen");
            showPlaybackError(
              "Content not available. Please try again later.",
              "CONTENT_NOT_FOUND"
            );
          } else {
            // Other HTTP errors - try to update playback first
            console.log(
              `⚠️ HTTP ${errorCode} error - attempting playback update`
            );
            handlePlaybackUpdate(`HTTP_${errorCode}`, true);
          }
        } else if (data.details === "MANIFEST_LOAD_ERROR") {
          // Manifest loading error - likely network or server issue
          console.log("📋 Manifest load error - attempting playback update");
          handlePlaybackUpdate("MANIFEST_ERROR", true);
        } else if (data.details === "LEVEL_LOAD_ERROR") {
          // Quality level loading error - try to continue with current quality
          console.log(
            "📊 Quality level load error - attempting to continue playback"
          );
          handlePlaybackUpdate("QUALITY_ERROR", true);
        } else {
          // Other fatal errors - show error screen
          console.log("❌ Unknown fatal error - showing error screen");
          showPlaybackError(
            "Video playback error. Please try again later.",
            "UNKNOWN_ERROR"
          );
        }
      } else {
        // Non-fatal errors - log but don't stop playback
        console.warn("⚠️ Non-fatal HLS error:", data.details);

        // Still check for 401/403 in non-fatal errors - these need immediate attention
        if (
          data.details === "FRAG_LOAD_ERROR" &&
          data.response &&
          (data.response.code === 401 || data.response.code === 403)
        ) {
          console.log(
            "🔐 401/403 error in non-fatal error - updating playback session immediately"
          );
          handlePlaybackUpdate("AUTH_ERROR_NON_FATAL", true);
        }
      }
    });

    hlsInstance.on(Hls.Events.FRAG_LOADED, () => {
      // Update buffering progress when fragments are loaded
      bufferedPercent.value = calculateBufferedPercent();
    });
  } else if (videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")) {
    console.log("🍎 Using native HLS support (Safari)");
    videoPlayer.value.src = url;
    // Auto-play immediately for native HLS using coordinated system
    if (props.autoplay && !isPlaying.value) {
      safePlay(false, "high").catch((err) => {
        console.warn("Auto-play failed:", err);
      });
    }
  } else {
    console.log("⚠️ HLS not supported, using URL directly");
    // Only set src directly if HLS.js is definitely not available
    if (videoPlayer.value && typeof Hls === "undefined") {
      videoPlayer.value.src = url;
      console.log("✅ Set video src for fallback:", url);
      // Auto-play immediately for fallback using coordinated system
      if (props.autoplay && !isPlaying.value) {
        safePlay(false, "high").catch((err) => {
          console.warn("Auto-play failed:", err);
        });
      }
    } else {
      console.log("⏳ Waiting for HLS.js to load before setting video src");
    }
  }
};

// Token update callback for auto-updating video URL
const onTokenUpdate = async (newToken) => {
  console.log("🔄 Updating video with new token:", newToken);

  if (hlsInstance && hlsInstance.media) {
    try {
      // Store current playback position and state
      const currentTime = videoPlayer.value.currentTime;
      const wasPlaying = !videoPlayer.value.paused;
      const currentVolume = videoPlayer.value.volume;
      const currentPlaybackRate = videoPlayer.value.playbackRate;

      console.log(
        "🔄 Current playback state - Time:",
        currentTime,
        "Playing:",
        wasPlaying,
        "Volume:",
        currentVolume,
        "Rate:",
        currentPlaybackRate
      );

      // Check if we have a pre-buffered stream that's truly ready
      if (preloadBufferReady && isStreamReady && preloadHls && preloadUrl) {
        console.log("Using fully ready pre-buffered stream for instant switch");

        // Perform instant switch using pre-buffered stream
        await performInstantSwitch(
          currentTime,
          wasPlaying,
          currentVolume,
          currentPlaybackRate
        );
      } else {
        console.log(
          "No fully ready pre-buffered stream available, switching normally..."
        );

        // Switch to new stream seamlessly
        await switchToNewStream(
          newToken,
          currentTime,
          wasPlaying,
          currentVolume,
          currentPlaybackRate
        );
      }
    } catch (error) {
      console.warn(`⚠️ Failed to update HLS source: ${error.message}`);
    }
  } else if (
    videoPlayer.value.src &&
    videoPlayer.value.src.includes("cloudflarestream.com")
  ) {
    // Update native video source
    try {
      // Store current playback position and state
      const currentTime = videoPlayer.value.currentTime;
      const wasPlaying = !videoPlayer.value.paused;
      const currentVolume = videoPlayer.value.volume;
      const currentPlaybackRate = videoPlayer.value.playbackRate;

      videoPlayer.value.src = newToken;
      videoPlayer.value.load();
      console.log("✅ Native video source updated with new token");

      // Restore playback position and state
      videoPlayer.value.addEventListener(
        "loadedmetadata",
        () => {
          if (currentTime > 0) {
            videoPlayer.value.currentTime = currentTime;
            console.log(
              `⏱️ Restored playback position to ${Math.floor(currentTime)}s`
            );
          }
          // Restore settings
          videoPlayer.value.volume = currentVolume;
          videoPlayer.value.playbackRate = currentPlaybackRate;

          if (wasPlaying) {
            safePlay(true, "high").catch((e) =>
              console.warn(`⚠️ Could not auto-resume: ${e.message}`)
            );
          }
        },
        { once: true }
      );
    } catch (error) {
      console.warn(`⚠️ Failed to update native video source: ${error.message}`);
    }
  }
};

// Seamless source switching function
const switchToNewStream = async (
  newUrl,
  currentTime,
  wasPlaying,
  volume,
  playbackRate
) => {
  return new Promise((resolve) => {
    if (!Hls.isSupported()) {
      // Fallback for non-HLS browsers
      videoPlayer.value.src = newUrl;
      if (wasPlaying) {
        // For non-HLS, we still need to wait for buffer
        waitForSufficientBuffer();
      }
      videoPlayer.value.volume = volume;
      videoPlayer.value.playbackRate = playbackRate;
      resolve();
      return;
    }

    console.log("Performing seamless source switch...");

    // CRITICAL: Set source switching flag to bypass buffer monitoring
    isSourceSwitching = true;

    // Switch the source URL of the current HLS instance
    // This maintains the same HLS instance and prevents detachment
    hlsInstance.loadSource(newUrl);

    // Position at the correct time
    videoPlayer.value.currentTime = currentTime;

    // Restore settings immediately
    videoPlayer.value.volume = volume;
    videoPlayer.value.playbackRate = playbackRate;

    // CRITICAL: Resume playback immediately after source switch
    // The video element naturally pauses during source loading, so we must resume
    if (wasPlaying) {
      console.log("Resuming playback immediately after source switch...");
      // Network-adaptive delay: faster on good networks, longer on poor networks
      const adaptiveDelay = NETWORK_OPTIMIZATION.adaptiveBufferLength
        ? 50
        : 100;
      setTimeout(() => {
        // Use unified playback control to prevent conflicts
        safePlay(true, "high").catch((error) => {
          console.log(
            `Failed to resume playback after source switch: ${error.message}`
          );
        });
      }, adaptiveDelay);
    }

    console.log(
      `Seamless source switch complete: time=${videoPlayer.value.currentTime.toFixed(
        2
      )}s`
    );

    // Reset source switching flag after a brief delay
    setTimeout(() => {
      isSourceSwitching = false;
      console.log("Source switching flag reset");
    }, 1000);

    resolve();
  });
};

// Instant switch using pre-buffered stream
const performInstantSwitch = async (
  currentTime,
  wasPlaying,
  volume,
  playbackRate
) => {
  return new Promise((resolve) => {
    if (!preloadHls || !preloadBufferReady) {
      console.log(
        "Pre-buffered stream not ready, falling back to normal switch"
      );
      resolve();
      return;
    }

    console.log("Performing instant switch using pre-buffered stream...");

    // CRITICAL: Set source switching flag to bypass buffer monitoring
    isSourceSwitching = true;

    // OPTIMIZATION: Preserve quality level during switch
    const currentQualityLevel = hlsInstance.currentLevel;
    const currentAutoLevelCapping = hlsInstance.autoLevelCapping;

    // Switch the source URL of the current HLS instance
    // This maintains the same HLS instance and prevents detachment
    hlsInstance.loadSource(preloadUrl);

    // Position at the correct time
    videoPlayer.value.currentTime = currentTime;

    // Restore settings immediately
    videoPlayer.value.volume = volume;
    videoPlayer.value.playbackRate = playbackRate;

    // CRITICAL: Resume playback immediately after source switch
    if (wasPlaying) {
      console.log("Resuming playback immediately after instant switch...");
      const adaptiveDelay = NETWORK_OPTIMIZATION.adaptiveBufferLength
        ? 50
        : 100;
      setTimeout(() => {
        safePlay(true, "high").catch((error) => {
          console.log(
            `Failed to resume playback after instant switch: ${error.message}`
          );
        });
      }, adaptiveDelay);
    }

    // Restore quality settings after source switch
    setTimeout(() => {
      if (NETWORK_OPTIMIZATION.enableQualityAdaptation) {
        // Restore previous quality level if available
        if (
          currentQualityLevel !== -1 &&
          hlsInstance.levels &&
          hlsInstance.levels.length > currentQualityLevel
        ) {
          hlsInstance.currentLevel = currentQualityLevel;
          console.log(`Quality level restored to: ${currentQualityLevel}`);
        }

        // Restore auto level capping
        hlsInstance.autoLevelCapping = currentAutoLevelCapping;
        console.log("Auto level capping restored");
      }
    }, 500);

    // Clean up pre-buffer resources
    if (preloadHls) {
      preloadHls.destroy();
      preloadHls = null;
    }

    preloadBufferReady = false;
    preloadUrl = null;
    preloadExpiry = null;
    isPreloading = false;

    console.log(
      `Instant switch complete: time=${videoPlayer.value.currentTime.toFixed(
        2
      )}s, playing=${!videoPlayer.value.paused}`
    );

    // Reset source switching flag after a brief delay
    setTimeout(() => {
      isSourceSwitching = false;
      console.log("Source switching flag reset");
    }, 1000);

    resolve();
  });
};

// Wait for sufficient buffer function
const waitForSufficientBuffer = () => {
  if (!hlsInstance || !hlsInstance.media) return;

  const checkBuffer = () => {
    try {
      const buffered = hlsInstance.media.buffered;
      if (buffered.length === 0) {
        setTimeout(checkBuffer, 200);
        return;
      }

      const currentTime = hlsInstance.media.currentTime;
      let bufferLength = 0;

      for (let i = 0; i < buffered.length; i++) {
        const start = buffered.start(i);
        const end = buffered.end(i);

        if (currentTime >= start && currentTime < end) {
          bufferLength = end - currentTime;
          break;
        }
      }

      if (bufferLength >= MIN_BUFFER_LENGTH) {
        console.log(
          `Sufficient buffer available (${bufferLength.toFixed(
            1
          )}s), starting playback`
        );

        // Use unified playback control for initial start
        safePlay(false, "high")
          .then(() => {
            console.log("Initial playback started successfully");
          })
          .catch((error) => {
            console.log(`Failed to start initial playback: ${error.message}`);
          });
      } else {
        // Still building initial buffer
        setTimeout(checkBuffer, 200);
      }
    } catch (error) {
      console.log(`Error checking buffer: ${error.message}`);
      setTimeout(checkBuffer, 200);
    }
  };

  checkBuffer();
};

// Initialize playback session and load video
const initializePlaybackSession = async () => {
  if (!props.contentId) return;

  try {
    // Loading message removed - simplified loading experience
    isLoading.value = true;

    // Start playback session using /start-playback API
    const session = await startPlayback(props.contentId, navigator.userAgent);

    if (session) {
      console.log("✅ Playback session started:", session);
      emit("sessionStarted", session);

      // Set the stream URL to the token (which is the full video URL)
      streamUrl.value = session.token;
      console.log("🎬 Video URL set from session token");

      // Start heartbeat and smart token refresh for this session
      startHeartbeat();
      startSmartTokenRefresh();

      // Initialize HLS.js with the token URL
      nextTick(() => {
        if (videoPlayer.value) {
          initializeHLS(session.token);
        } else {
          console.log("Video player not found");
        }
      });

      isLoading.value = false;
    }
  } catch (error) {
    console.error("❌ Error starting playback session:", error);
    // Loading message removed - simplified loading experience
    isLoading.value = false;
    emit("error", {
      code: "SESSION_FAILED",
      message: "Failed to start playback session",
    });
  }
};

// Initialize player
const initializePlayer = () => {
  if (props.contentId) {
    streamUrl.value = null;
    isLoading.value = true;
    // Loading message removed - simplified loading experience
    error.value = null;
    isBuffering.value = false;
    isPlaying.value = false;
    canPlay.value = false;

    // Check if using direct URL or session-based approach
    if (props.useDirectUrl && props.videoUrl) {
      console.log("🎬 Using direct video URL:", props.videoUrl);
      initializeDirectVideo(props.videoUrl);
    } else if (props.useDirectUrl && !props.videoUrl) {
      // Direct URL mode but no URL provided
      console.error("❌ Direct URL mode enabled but no video URL provided");
      error.value = {
        code: "NO_VIDEO_URL",
        message: "Video URL not available. Please try again later.",
      };
      isLoading.value = false;
    } else {
      // Initialize playback session instead of old streaming approach
      console.log("🔐 Using session-based playback");
      initializePlaybackSession();
    }

    // Start buffering immediately when component mounts
    console.log("🚀 Component mounted, starting immediate buffering...");
  }
};

// Watch for session changes to auto-update video URL
watch(currentSession, (newSession) => {
  if (newSession && videoPlayer.value) {
    // Auto-update video URL when token changes
    autoUpdateVideoUrl(videoPlayer.value, onTokenUpdate);
  }
});

// Watch for token expiry to show warnings and trigger refresh
watch(isTokenExpiringSoon, (expiringSoon) => {
  if (expiringSoon) {
    console.log("⚠️ Token expiring soon, will auto-refresh");
  }
});

// Watch for token expiry to show warnings
watch(isTokenExpiringSoon, (expiringSoon) => {
  if (expiringSoon) {
    console.log("⚠️ Token expiring soon, will auto-refresh");
  }
});

// Initialize streaming when component mounts
const initializeStreaming = async () => {
  if (!props.contentId) return;

  try {
    // Initialize playback session
    await initializePlaybackSession();
  } catch (error) {
    console.error("Error initializing streaming:", error);
  }
};

// In your component setup or mounted hook
onMounted(() => {
  initializePlayer();
});

// For seeking functionality
const handleSeek = (time) => {
  seekTo(time);
};

// Watch for changes to contentId
watch(
  () => props.contentId,
  (newContentId, oldContentId) => {
    if (newContentId !== oldContentId) {
      // Stop current session if exists
      if (isSessionActive.value) {
        stopPlayback();
        emit("sessionStopped");
      }
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
      // Stop current session if exists
      if (isSessionActive.value) {
        stopPlayback();
        emit("sessionStopped");
      }
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

// Periodic buffering check to ensure accurate progress tracking
let bufferingCheckInterval = null;

// Start periodic buffering check when video is ready
const startBufferingCheck = () => {
  if (bufferingCheckInterval) {
    clearInterval(bufferingCheckInterval);
  }

  bufferingCheckInterval = setInterval(() => {
    if (videoPlayer.value && streamUrl.value) {
      bufferedPercent.value = calculateBufferedPercent();
    }
  }, 500); // Check every 500ms for smoother progress updates

  // Started periodic buffering check
};

// Cleanup on unmount
onUnmounted(() => {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (preloadHls) {
    preloadHls.destroy();
    preloadHls = null;
  }

  // Stop playback session
  if (isSessionActive.value) {
    stopPlayback();
    emit("sessionStopped");
  }

  // Clear all intervals and timers
  if (bufferingCheckInterval) {
    clearInterval(bufferingCheckInterval);
  }

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }

  if (bufferMonitorInterval) {
    clearInterval(bufferMonitorInterval);
  }

  if (bufferRebuildTimer) {
    clearTimeout(bufferRebuildTimer);
  }

  // Reset all state variables
  playbackState = "playing";
  isManualResume = false;
  resumeCooldown = false;
  playbackQueue = [];
  isProcessingPlayback = false;
  lastPlaybackAction = 0;
  isPreloading = false;
  preloadBufferReady = false;
  preloadUrl = null;
  preloadExpiry = null;
  isStreamReady = false;
  isSourceSwitching = false;
  lastQualityLevel = -1;
  bufferWarningShown = false;
  bufferCriticalShown = false;
  isBufferRebuilding = false;
});

// Expose player methods for parent components
defineExpose({
  play: () => videoPlayer.value && videoPlayer.value.play(),
  pause: () => videoPlayer.value && videoPlayer.value.pause(),
  setVolume,
  setMuted,
  seekTo,
  togglePlay,
  retryLoad,
  // Expose session methods
  startPlayback: () => initializePlaybackSession(),
  stopPlayback,
  getSessionStats: () => stats.value,
  getSessionDuration: () => sessionDuration.value,
  getTokenExpiry: () => tokenExpiresIn.value,
  // Expose heartbeat and token refresh methods
  startHeartbeat,
  startSmartTokenRefresh,
  sendHeartbeat,
  // Expose session status
  isSessionActive: () => isSessionActive.value,
  isTokenExpiringSoon: () => isTokenExpiringSoon.value,
  getTokenExpiry: () => tokenExpiresIn.value,
  // Manual session refresh
  refreshSession: async () => {
    if (props.contentId && isSessionActive.value) {
      console.log("🔄 Manual session refresh requested");
      try {
        await updatePlayback(props.contentId);
        emit("tokenRefreshed");
        return true;
      } catch (err) {
        console.error("❌ Manual session refresh failed:", err);
        return false;
      }
    }
    return false;
  },
  // Expose advanced playback control methods
  safePlay,
  safePause,
  coordinatedPlay,
  coordinatedPause,
  // Expose buffer monitoring methods
  startProactiveBufferMonitoring,
  getCurrentBufferLength,
  // Expose pre-buffering methods
  startPreBuffering,
  // Expose quality control methods
  reduceQualityToLowest,
  reduceQualityByOne,
  increaseQualityGradually,
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

/* Error overlay styles */
.error-icon {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.retry-button,
.reset-button {
  transition: all 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 208, 5, 0.3);
}

.reset-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}
</style>
