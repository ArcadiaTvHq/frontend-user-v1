<template>
  <div
    v-if="show"
    class="advert-overlay absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
  >
    <!-- Video Ad -->
    <div
      v-if="advert?.type === 'short_video' || advert?.type === 'long_video'"
      class="w-full h-full cursor-pointer"
      @click="handleAdvertInteraction"
      title="Click to visit advertiser"
    >
      <video
        ref="advertVideo"
        :poster="advert.thumbnail_url"
        class="w-full h-full object-contain"
        @loadedmetadata="onVideoLoaded"
        @timeupdate="onTimeUpdate"
        @ended="onAdEnded"
        @error="onAdError"
        @canplay="onCanPlay"
        @playing="onPlaying"
        @waiting="onWaiting"
        autoplay
        playsinline
        webkit-playsinline
      >
        Your browser does not support the video tag.
      </video>

      <!-- Advert Label with Enhanced Countdown -->
      <div
        class="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-10"
      >
        <div class="flex items-center space-x-2">
          <span class="font-medium">Ad</span>
          <span class="text-yellow-400"
            >{{ getElapsedTime() }} / {{ getTotalTime() }}</span
          >
        </div>
      </div>

      <!-- Skip Button for long videos -->
      <button
        v-if="advert.type === 'long_video' && canSkip"
        @click="skipAd"
        class="absolute top-4 left-4 bg-[#FFD005] hover:bg-[#CE8F00] text-black px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        Skip Ad ({{ skipCountdown }}s)
      </button>

      <!-- Close Button - Only show after 60 seconds for long videos -->
      <button
        v-if="
          canCloseAd &&
          (advert.type === 'long_video' || advert.type === 'image')
        "
        @click="closeAd"
        class="absolute top-4 right-4 bg-black bg-opacity-75 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200 z-20"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Image Ad -->
    <div
      v-else-if="advert?.type === 'image'"
      class="text-center max-w-2xl mx-auto p-6 relative cursor-pointer"
      @click="openAdvertUrl"
      title="Click to visit advertiser"
    >
      <!-- Advert Label with Enhanced Countdown -->
      <div
        class="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-10"
      >
        <div class="flex items-center space-x-2">
          <span class="font-medium">Ad</span>
          <span class="text-yellow-400"
            >{{ getElapsedTime() }} / {{ getTotalTime() }}</span
          >
        </div>
      </div>

      <img
        :src="advert.asset_url"
        :alt="advert.title"
        class="w-full h-auto max-h-96 object-contain rounded-lg mb-4"
      />
      <h3 class="text-xl font-bold text-white mb-2">{{ advert.title }}</h3>
      <p class="text-gray-300 mb-4">{{ advert.description }}</p>

      <!-- Close Button - Only show after 30 seconds for images -->
      <button
        v-if="canCloseAd && advert.type === 'image'"
        @click="closeAd"
        class="absolute top-4 right-4 bg-black bg-opacity-75 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200 z-20"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-else class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD005] mx-auto mb-4"
      ></div>
      <p class="text-white text-lg">Loading advertisement...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import Hls from "hls.js";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  advert: {
    type: Object,
    default: null,
  },
  skipDelay: {
    type: Number,
    default: 5, // seconds before skip button appears for long videos
  },
});

const emit = defineEmits(["close", "skip"]);

// Function to open advert URL in new tab
const openAdvertUrl = () => {
  // Try to find the URL from various possible property names
  const advertUrl =
    props.advert?.url ||
    props.advert?.link ||
    props.advert?.target_url ||
    props.advert?.click_url ||
    props.advert?.redirect_url;

  if (advertUrl) {
    window.open(advertUrl, "_blank", "noopener,noreferrer");
  }
};

const advertVideo = ref(null);
const canSkip = ref(false);
const skipCountdown = ref(props.skipDelay);
const countdownInterval = ref(null);

// Countdown for advert display
const countdown = ref(props.advert?.duration || 30);
const advertCountdownInterval = ref(null);
const imageCountdownInterval = ref(null);

// Close button control - only show after 60 seconds
const canCloseAd = ref(false);
const closeButtonTimer = ref(null);

// HLS instance for video ads
let hlsInstance = null;

const onVideoLoaded = () => {
  // Only handle video ads in this function
  if (
    props.advert?.type === "short_video" ||
    props.advert?.type === "long_video"
  ) {
    // Start advert countdown for video ads
    startAdvertCountdown();

    // Start close button timer for long videos
    if (props.advert?.type === "long_video") {
      startCloseButtonTimer();
      startSkipCountdown();
    }
  }

  // Setup user interaction listeners when advert video loads
  setupAdvertUserInteractionListeners();

  // Handle autoplay restrictions with user interaction awareness
  setTimeout(() => {
    if (advertVideo.value && advertVideo.value.paused) {
      // Check if user has interacted with the page
      const hasUserInteracted =
        document.querySelector(":focus") ||
        document.querySelector(":hover") ||
        window.userHasInteracted;

      if (hasUserInteracted) {
        console.log("✅ User has interacted, attempting advert autoplay");
        advertVideo.value.muted = false;
        advertVideo.value.play().catch((err) => {
          console.warn(
            "Advert autoplay failed even with user interaction:",
            err
          );
          // Fallback: show play button
          showAdvertPlayButton();
        });
      } else {
        console.log(
          "⚠️ No user interaction detected for advert, showing play button"
        );
        // Show play button instead of autoplay
        showAdvertPlayButton();
      }
    }
  }, 1000); // 1 second delay to check if autoplay worked
};

// Handle advert overlay interactions to enable unmuting
const handleAdvertInteraction = () => {
  if (
    window.userHasInteracted &&
    advertVideo.value &&
    advertVideo.value.muted
  ) {
    console.log("🔊 Unmuting advert after overlay interaction");
    advertVideo.value.muted = false;

    // Remove unmute indicator if it exists
    const unmuteIndicator = document.querySelector(".advert-unmute-indicator");
    if (unmuteIndicator) {
      unmuteIndicator.remove();
    }
  }
};

// Setup user interaction listeners for advert
const setupAdvertUserInteractionListeners = () => {
  const events = ["click", "touchstart", "keydown", "mousemove", "scroll"];

  const handleUserInteraction = () => {
    console.log("✅ User interaction detected for advert, enabling autoplay");
    window.userHasInteracted = true;

    // Remove all listeners
    events.forEach((event) => {
      document.removeEventListener(event, handleUserInteraction);
    });

    // Try to start advert video
    if (advertVideo.value && advertVideo.value.paused) {
      advertVideo.value.muted = false;
      advertVideo.value.play().catch((err) => {
        console.warn("Failed to start advert after user interaction:", err);
      });
    }

    // Also try to unmute if currently muted
    if (advertVideo.value && advertVideo.value.muted) {
      advertVideo.value.muted = false;
      console.log("🔊 Unmuted advert after user interaction");
    }
  };

  // Add listeners
  events.forEach((event) => {
    document.addEventListener(event, handleUserInteraction, { once: true });
  });

  // Also listen for video element interactions specifically
  if (advertVideo.value) {
    advertVideo.value.addEventListener("click", handleUserInteraction, {
      once: true,
    });
    advertVideo.value.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });
  }
};

// Show unmute indicator when advert is muted due to autoplay policy
const showUnmuteIndicator = () => {
  // Create an unmute indicator if it doesn't exist
  if (!document.querySelector(".advert-unmute-indicator")) {
    const indicator = document.createElement("div");
    indicator.className = "advert-unmute-indicator";
    indicator.innerHTML = `
      <div class="unmute-indicator-container">
        <button class="unmute-button" onclick="document.querySelector('.advert-unmute-indicator').remove(); document.querySelector('video').muted = false;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p class="unmute-text">Click to unmute</p>
      </div>
    `;

    // Style the indicator
    indicator.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      border-radius: 8px;
      padding: 12px;
      z-index: 1002;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    // Style the unmute button
    const unmuteButton = indicator.querySelector(".unmute-button");
    unmuteButton.style.cssText = `
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      margin: 0 auto 8px auto;
    `;

    // Style the text
    const unmuteText = indicator.querySelector(".unmute-text");
    unmuteText.style.cssText = `
      color: white;
      font-size: 12px;
      text-align: center;
      margin: 0;
    `;

    // Add hover effect
    unmuteButton.addEventListener("mouseenter", () => {
      unmuteButton.style.transform = "scale(1.1)";
      unmuteButton.style.background = "rgba(255,255,255,1)";
    });

    unmuteButton.addEventListener("mouseleave", () => {
      unmuteButton.style.transform = "scale(1)";
      unmuteButton.style.background = "rgba(255,255,255,0.9)";
    });

    // Add to advert container
    const advertContainer = advertVideo.value?.parentElement;
    if (advertContainer) {
      advertContainer.appendChild(indicator);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 10000);
    }
  }
};

// Show play button for advert when autoplay fails
const showAdvertPlayButton = () => {
  // Create a play button overlay if it doesn't exist
  if (!document.querySelector(".advert-play-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "advert-play-overlay";
    overlay.innerHTML = `
      <div class="advert-play-button-container">
        <button class="advert-play-button">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <p class="advert-play-text">Click to play advert</p>
      </div>
    `;

    // Style the overlay
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      cursor: pointer;
    `;

    // Style the play button
    const playButton = overlay.querySelector(".advert-play-button");
    playButton.style.cssText = `
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;

    // Style the text
    const playText = overlay.querySelector(".advert-play-text");
    playText.style.cssText = `
      color: white;
      margin-top: 12px;
      font-size: 14px;
      text-align: center;
    `;

    // Add hover effect
    playButton.addEventListener("mouseenter", () => {
      playButton.style.transform = "scale(1.1)";
      playButton.style.background = "rgba(255,255,255,1)";
    });

    playButton.addEventListener("mouseleave", () => {
      playButton.style.transform = "scale(1)";
      playButton.style.background = "rgba(255,255,255,0.9)";
    });

    // Add proper click handler with video reference safety
    playButton.addEventListener("click", () => {
      console.log("🎬 Advert play button clicked, attempting to start advert");

      // Remove the overlay first
      if (overlay.parentNode) {
        overlay.remove();
      }

      // Try to start the advert video using the proper reference
      if (advertVideo.value && !advertVideo.value.paused) {
        console.log("✅ Advert video is already playing");
        return;
      }

      if (advertVideo.value && advertVideo.value.paused) {
        console.log("▶️ Starting advert video from play button");
        advertVideo.value.muted = false;
        advertVideo.value.play().catch((err) => {
          console.warn("Failed to start advert video from play button:", err);
        });
      } else {
        console.warn("⚠️ Advert video player not available");
      }
    });

    // Add to advert video container
    const advertContainer = advertVideo.value?.parentElement;
    if (advertContainer) {
      advertContainer.style.position = "relative";
      advertContainer.appendChild(overlay);
    }
  }
};

// Initialize HLS for video ads
const initializeHLS = (url) => {
  if (!url || !advertVideo.value) {
    return;
  }

  // Prevent double initialization with the same URL
  if (hlsInstance && hlsInstance.url === url) {
    return;
  }

  // Clean up existing HLS instance
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      // Simplified configuration for advert playback
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 30 * 1000 * 1000, // 30MB for ads
      enableWorker: true,
      startLevel: -1,
      debug: false, // Disable debug for production
    });

    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(advertVideo.value);

    // Add comprehensive HLS event listeners
    hlsInstance.on(Hls.Events.MANIFEST_LOADING, () => {
      // Manifest loading started
    });

    hlsInstance.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
      // Manifest loaded
    });

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      // Try to play the video with user interaction awareness
      if (advertVideo.value) {
        // Check if user has interacted with the page
        const hasUserInteracted =
          document.querySelector(":focus") ||
          document.querySelector(":hover") ||
          window.userHasInteracted;

        if (hasUserInteracted) {
          console.log("✅ User has interacted, attempting advert autoplay");
          advertVideo.value.muted = false;
          advertVideo.value
            .play()
            .then(() => {
              console.log("✅ Advert started playing successfully (unmuted)");
            })
            .catch((error) => {
              console.warn(
                "Advert autoplay failed, trying muted fallback:",
                error
              );
              // Fallback: mute and try to play, then unmute after a delay
              advertVideo.value.muted = true;
              advertVideo.value
                .play()
                .then(() => {
                  console.log(
                    "✅ Advert started playing muted, will unmute in 2 seconds"
                  );
                  // Unmute after 2 seconds with user interaction check
                  setTimeout(() => {
                    if (advertVideo.value) {
                      // Check if user has interacted before unmuting
                      const hasUserInteracted =
                        document.querySelector(":focus") ||
                        document.querySelector(":hover") ||
                        window.userHasInteracted;

                      if (hasUserInteracted) {
                        console.log(
                          "✅ User interaction detected, unmuting advert"
                        );
                        // Try to unmute, but handle failure gracefully
                        try {
                          advertVideo.value.muted = false;
                          console.log("🔊 Advert unmuted successfully");
                        } catch (error) {
                          console.warn(
                            "⚠️ Unmuting failed (try/catch), showing play button:",
                            error
                          );
                          showAdvertPlayButton();
                        }

                        // Also handle unmuting failure through promise rejection
                        // Some browsers throw errors on unmuting even with user interaction
                        if (advertVideo.value && advertVideo.value.muted) {
                          // Double-check if unmuting actually worked
                          setTimeout(() => {
                            if (advertVideo.value && advertVideo.value.muted) {
                              console.warn(
                                "⚠️ Unmuting failed (still muted), showing play button"
                              );
                              showAdvertPlayButton();
                            }
                          }, 100);
                        }

                        // Show play button as immediate fallback for unmuting issues
                        // This ensures user always has a way to interact with the advert
                        setTimeout(() => {
                          if (advertVideo.value && advertVideo.value.muted) {
                            console.log(
                              "🎬 Showing play button as unmuting fallback"
                            );
                            showAdvertPlayButton();
                          }
                        }, 2500); // Show after 2.5 seconds if still muted
                      } else {
                        console.log(
                          "⚠️ No user interaction for unmuting, showing play button"
                        );
                        // Show play button immediately when no user interaction
                        showAdvertPlayButton();
                      }
                    }
                  }, 2000);
                })
                .catch((fallbackError) => {
                  console.warn(
                    "Advert fallback autoplay also failed:",
                    fallbackError
                  );
                  // Show play button as final fallback
                  showAdvertPlayButton();
                });
            });
        } else {
          console.log(
            "⚠️ No user interaction detected for advert, showing play button"
          );
          // Setup user interaction listeners and show play button
          setupAdvertUserInteractionListeners();
          showAdvertPlayButton();
        }
      }
    });

    hlsInstance.on(Hls.Events.LEVEL_LOADING, (event, data) => {
      // Level loading
    });

    hlsInstance.on(Hls.Events.LEVEL_LOADED, (event, data) => {
      // Level loaded
    });

    hlsInstance.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
      // Level switching
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        // For fatal errors, close the ad
        emit("close");
      }
    });
  } else if (advertVideo.value.canPlayType("application/vnd.apple.mpegurl")) {
    // Fallback to native HLS support
    advertVideo.value.src = url;
  } else {
    // HLS not supported for advert video
    emit("close");
  }
};

const onTimeUpdate = () => {
  // Handle video time updates if needed
};

const onCanPlay = () => {
  // Video can play
};

const onPlaying = () => {
  // Video is playing
};

const onWaiting = () => {
  // Video is waiting/buffering
};

const onAdEnded = () => {
  emit("close");
};

const onAdError = (error) => {
  // Advert video error
  emit("close");
};

const startAdvertCountdown = () => {
  // Clear any existing countdown
  if (advertCountdownInterval.value) {
    clearInterval(advertCountdownInterval.value);
    advertCountdownInterval.value = null;
  }

  // Only start countdown for video ads (not image ads)
  if (props.advert?.type !== "image") {
    advertCountdownInterval.value = setInterval(() => {
      countdown.value--;

      if (countdown.value <= 0) {
        clearInterval(advertCountdownInterval.value);
        advertCountdownInterval.value = null;
        emit("close");
      }
    }, 1000);
  }
};

// Start close button timer - show after 30 seconds for image ads, 60 seconds for video ads
const startCloseButtonTimer = () => {
  const timerDuration = props.advert?.type === "image" ? 30000 : 60000; // 30s for images, 60s for videos

  // Clear any existing timer
  if (closeButtonTimer.value) {
    clearTimeout(closeButtonTimer.value);
  }

  closeButtonTimer.value = setTimeout(() => {
    canCloseAd.value = true;
  }, timerDuration);
};

// Start image ad countdown - counts up to 30 seconds then shows close button
const startImageAdCountdown = () => {
  if (props.advert?.type === "image") {
    // Clear any existing image countdown
    if (imageCountdownInterval.value) {
      clearInterval(imageCountdownInterval.value);
      imageCountdownInterval.value = null;
    }

    // Reset countdown for image ads
    countdown.value = 0;

    // Create a countdown that goes from 0 to 30
    imageCountdownInterval.value = setInterval(() => {
      countdown.value++;

      if (countdown.value >= 30) {
        clearInterval(imageCountdownInterval.value);
        imageCountdownInterval.value = null;
        canCloseAd.value = true;
      }
    }, 1000);
  }
};

// Helper functions for enhanced countdown display
const getElapsedTime = () => {
  if (props.advert?.type === "image") {
    // For image ads, countdown goes from 0 to 60
    return `${countdown.value}s`;
  } else {
    // For video ads, countdown goes from duration to 0
    const totalDuration = props.advert?.duration || 30;
    const elapsed = totalDuration - countdown.value;
    return `${elapsed}s`;
  }
};

const getTotalTime = () => {
  if (props.advert?.type === "image") {
    // For image ads, always show 30s total
    return "30s";
  } else {
    // For video ads, show actual duration
    const totalDuration = props.advert?.duration || 30;
    return `${totalDuration}s`;
  }
};

const startSkipCountdown = () => {
  countdownInterval.value = setInterval(() => {
    skipCountdown.value--;
    if (skipCountdown.value <= 0) {
      canSkip.value = true;
      clearInterval(countdownInterval.value);
    }
  }, 1000);
};

const skipAd = () => {
  emit("skip");
};

const closeAd = () => {
  emit("close");
};

const resetCountdown = () => {
  canSkip.value = false;
  skipCountdown.value = props.skipDelay;

  // Reset advert countdown based on type
  if (props.advert?.type === "image") {
    countdown.value = 0; // Image ads start at 0 and count up to 30
  } else {
    countdown.value = props.advert?.duration || 30; // Video ads count down from duration
  }

  // Reset close button state
  canCloseAd.value = false;

  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }

  if (advertCountdownInterval.value) {
    clearInterval(advertCountdownInterval.value);
    advertCountdownInterval.value = null;
  }

  if (imageCountdownInterval.value) {
    clearInterval(imageCountdownInterval.value);
    imageCountdownInterval.value = null;
  }

  if (closeButtonTimer.value) {
    clearTimeout(closeButtonTimer.value);
  }

  // Only destroy advert HLS instance, not the main video's HLS
  if (hlsInstance && advertVideo.value) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetCountdown();

      // Initialize HLS for video ads when overlay becomes visible
      if (
        props.advert &&
        (props.advert.type === "short_video" ||
          props.advert.type === "long_video")
      ) {
        nextTick(() => {
          initializeHLS(props.advert.asset_url);
        });
      }

      // Start countdown for all advert types
      startAdvertCountdown();

      // Start close button timer for long videos and images
      if (
        props.advert?.type === "long_video" ||
        props.advert?.type === "image"
      ) {
        startCloseButtonTimer();
      }

      // Start special countdown for image ads (0s to 30s)
      if (props.advert?.type === "image") {
        // Small delay to ensure resetCountdown has completed
        nextTick(() => {
          startImageAdCountdown();
        });
      }
    } else {
      // Clean up advert HLS when hiding overlay
      if (hlsInstance && advertVideo.value) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }
  }
);

watch(
  () => props.advert,
  (newAdvert, oldAdvert) => {
    // Only reset if advert actually changed
    if (oldAdvert?.id !== newAdvert?.id) {
      resetCountdown();

      // Initialize HLS for video ads when advert changes
      if (
        newAdvert &&
        (newAdvert.type === "short_video" || newAdvert.type === "long_video")
      ) {
        nextTick(() => {
          initializeHLS(newAdvert.asset_url);

          // Setup user interaction listeners when advert changes
          setupAdvertUserInteractionListeners();
        });
      }
    }
  }
);

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }

  if (advertCountdownInterval.value) {
    clearInterval(advertCountdownInterval.value);
    advertCountdownInterval.value = null;
  }

  if (imageCountdownInterval.value) {
    clearInterval(imageCountdownInterval.value);
    imageCountdownInterval.value = null;
  }

  if (closeButtonTimer.value) {
    clearTimeout(closeButtonTimer.value);
  }

  // Clean up HLS instance
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});
</script>

<style scoped>
.advert-overlay {
  backdrop-filter: blur(4px);
}
</style>
