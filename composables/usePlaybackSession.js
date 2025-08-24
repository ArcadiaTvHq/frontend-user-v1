import { ref, computed, onUnmounted } from "vue";
import { PlaybackService } from "~/api/services/playback.service";

export function usePlaybackSession() {
  // Session state
  const currentSession = ref(null);
  const sessionStartTime = ref(null);
  const isSessionActive = ref(false);
  const isLoading = ref(false);
  const error = ref(null);

  // Intervals
  let heartbeatInterval = null;
  let tokenRefreshInterval = null;

  // Stats
  const stats = ref({
    heartbeatCount: 0,
    tokenRefreshCount: 0,
    sessionDuration: 0,
    activeTokens: 0,
  });

  // Computed properties
  const sessionDuration = computed(() => {
    if (!sessionStartTime.value) return 0;
    return Math.floor((Date.now() - sessionStartTime.value) / 1000);
  });

  const tokenExpiresIn = computed(() => {
    if (!currentSession.value?.exp) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, currentSession.value.exp - now);
  });

  const isTokenExpiringSoon = computed(() => {
    return tokenExpiresIn.value < 60; // Less than 1 minute
  });

  const isTokenValid = computed(() => {
    return tokenExpiresIn.value > 0;
  });

  // Session management methods
  const startPlayback = async (contentId, userAgent) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await PlaybackService.startPlayback(
        contentId,
        userAgent
      );

      if (response.success && response.data) {
        currentSession.value = response.data;
        sessionStartTime.value = Date.now();
        isSessionActive.value = true;
        stats.value.activeTokens = 1;

        // Start heartbeat and token refresh
        startHeartbeat();
        startTokenRefresh();

        console.log("✅ Playback session started successfully", response.data);
        return response.data;
      } else {
        throw new Error(response.message || "Failed to start playback session");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      error.value = errorMessage;
      console.error("❌ Error starting playback session:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updatePlayback = async (contentId) => {
    if (!currentSession.value) {
      throw new Error("No active session to update");
    }

    try {
      const response = await PlaybackService.updatePlayback(contentId);

      if (response.success && response.data) {
        // Update the current session with the new token
        currentSession.value = {
          ...currentSession.value,
          token: response.data.token,
          nbf: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        };

        stats.value.tokenRefreshCount++;
        console.log("✅ Playback session updated successfully");
        return response.data;
      } else {
        throw new Error(
          response.message || "Failed to update playback session"
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      error.value = errorMessage;
      console.error("❌ Error updating playback session:", err);
      throw err;
    }
  };

  const stopPlayback = () => {
    console.log("⏹️ Stopping playback session");

    // Clear intervals
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      tokenRefreshInterval = null;
    }

    // Reset state
    currentSession.value = null;
    sessionStartTime.value = null;
    isSessionActive.value = false;
    stats.value.activeTokens = 0;
    error.value = null;

    console.log("⏹️ Playback session stopped");
  };

  // Heartbeat functionality
  const sendHeartbeat = async (contentId) => {
    if (!currentSession.value) return;

    try {
      const response = await PlaybackService.sendHeartbeat(contentId);

      if (response.success) {
        stats.value.heartbeatCount++;
        console.log("💓 Heartbeat sent successfully");

        // Check if current token is about to expire (within 1 minute)
        if (isTokenExpiringSoon.value) {
          console.log("⚠️ Token expiring soon, triggering auto-refresh");
          await updatePlayback(contentId);
        }
      } else {
        console.warn("⚠️ Heartbeat failed:", response.message);
      }
    } catch (err) {
      console.warn("⚠️ Heartbeat error:", err);
    }
  };

  const startHeartbeat = () => {
    if (!currentSession.value?.contentId) return;

    // Send heartbeat every 30 seconds
    heartbeatInterval = setInterval(() => {
      sendHeartbeat(currentSession.value.contentId);
    }, 30000);

    console.log("💓 Heartbeat started (every 30 seconds)");
  };

  // Token refresh functionality
  const startTokenRefresh = () => {
    if (!currentSession.value?.contentId) return;

    // Check token expiry every 30 seconds and refresh if needed
    tokenRefreshInterval = setInterval(async () => {
      if (currentSession.value && isTokenExpiringSoon.value) {
        console.log("🔄 Proactive token refresh triggered");
        try {
          await updatePlayback(currentSession.value.contentId);
        } catch (err) {
          console.error("❌ Failed to refresh token:", err);
        }
      }
    }, 30000);

    console.log(
      "🔄 Proactive token refresh started (checking every 30 seconds)"
    );
  };

  // Auto-update video URL when token changes
  const autoUpdateVideoUrl = (videoElement, onTokenUpdate) => {
    if (!currentSession.value?.token || !videoElement) return;

    const currentSrc = videoElement.src;

    // Only update if there's already a video loaded
    if (currentSrc && currentSrc.includes("cloudflarestream.com")) {
      console.log("🔄 Auto-updating video URL with new token");

      // Store current playback position and state
      const currentTime = videoElement.currentTime;
      const wasPlaying = !videoElement.paused;

      // Call the callback to update the video source
      if (onTokenUpdate) {
        onTokenUpdate(currentSession.value.token);
      }

      // Restore playback position and state after a short delay
      setTimeout(() => {
        if (videoElement.readyState >= 1) {
          if (currentTime > 0) {
            videoElement.currentTime = currentTime;
            console.log(
              `⏱️ Restored playback position to ${Math.floor(currentTime)}s`
            );
          }
          if (wasPlaying) {
            videoElement.play().catch((e) => {
              console.warn(`⚠️ Could not auto-resume: ${e.message}`);
            });
          }
        }
      }, 1000);
    }
  };

  // Test private key
  const testPrivateKey = async () => {
    try {
      const response = await PlaybackService.testPrivateKey();

      if (response.success) {
        console.log("✅ Private key test successful:", response.data);
        return response.data;
      } else {
        throw new Error(response.message || "Private key test failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      error.value = errorMessage;
      console.error("❌ Error testing private key:", err);
      throw err;
    }
  };

  // Update stats
  const updateStats = () => {
    stats.value.sessionDuration = sessionDuration.value;
  };

  // Auto-update stats every second
  const statsInterval = setInterval(updateStats, 1000);

  // Cleanup on unmount
  onUnmounted(() => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }
    if (statsInterval) {
      clearInterval(statsInterval);
    }
  });

  return {
    // State
    currentSession,
    isSessionActive,
    isLoading,
    error,
    stats,

    // Computed
    sessionDuration,
    tokenExpiresIn,
    isTokenExpiringSoon,
    isTokenValid,

    // Methods
    startPlayback,
    updatePlayback,
    stopPlayback,
    sendHeartbeat,
    startHeartbeat,
    startTokenRefresh,
    autoUpdateVideoUrl,
    testPrivateKey,
    updateStats,
  };
}
