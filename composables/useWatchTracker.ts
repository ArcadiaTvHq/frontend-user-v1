import { ref, computed } from "vue";
import type { IWatchStretch } from "~/api/services/playback.service";

export interface WatchEvent {
  type: "play" | "pause" | "seek";
  timestamp: Date;
  duration: number;
  wasPlaying?: boolean;
  seekFrom?: number;
  seekTo?: number;
}

export function useWatchTracker(contentId: string) {
  // Watch stretches accumulated during current session
  const watchStretches = ref<IWatchStretch[]>([]);

  // Stretches that have been sent to server (for heartbeat deduplication)
  const sentStretches = ref<IWatchStretch[]>([]);

  // Current active stretch
  const currentStretch = ref<IWatchStretch | null>(null);

  // Event history for debugging
  const eventHistory = ref<WatchEvent[]>([]);

  // Computed properties
  const hasActiveStretch = computed(() => currentStretch.value !== null);
  const totalWatchStretches = computed(() => watchStretches.value.length);

  /**
   * Start a new watch stretch (on play)
   */
  const startStretch = (duration: number) => {
    // End current stretch if exists
    if (currentStretch.value) {
      endStretch(duration);
    }

    currentStretch.value = {
      start_time: new Date(),
      end_time: new Date(), // Will be updated when stopped
      start_duration: duration,
      end_duration: duration, // Will be updated when stopped
    };

    addEvent({
      type: "play",
      timestamp: new Date(),
      duration,
    });
  };

  /**
   * End current watch stretch (on pause)
   */
  const endStretch = (duration: number) => {
    if (!currentStretch.value) return;

    // Update the end values
    currentStretch.value.end_time = new Date();
    currentStretch.value.end_duration = duration;

    // Only add stretches that have meaningful duration (> 1 second)
    const stretchDuration = duration - currentStretch.value.start_duration;
    if (stretchDuration >= 1) {
      watchStretches.value.push({ ...currentStretch.value });

      addEvent({
        type: "pause",
        timestamp: new Date(),
        duration,
      });
    } else {
    }

    currentStretch.value = null;
  };

  /**
   * Handle seeking within video
   */
  const handleSeek = (fromDuration: number, toDuration: number) => {
    // End current stretch at seek position
    if (currentStretch.value) {
      endStretch(fromDuration);
    }

    addEvent({
      type: "seek",
      timestamp: new Date(),
      duration: toDuration,
      seekFrom: fromDuration,
      seekTo: toDuration,
    });

    // Start new stretch at seek position (if video was playing)
    // Note: This will be called manually when we detect video was playing during seek
  };

  /**
   * Record a play event - starts a new stretch or resumes current
   */
  const recordPlay = () => {
    // Note: Duration will be provided by video player's timeupdate event
  };

  /**
   * Record a pause event - ends current stretch
   */
  const recordPause = (duration: number) => {
    endStretch(duration);
  };

  /**
   * Record seeking activity
   */
  const recordSeek = (fromDuration: number, toDuration: number) => {
    handleSeek(fromDuration, toDuration);
  };

  /**
   * Record timeupdate when playing - updates current stretch
   */
  const recordTimeUpdate = (duration: number, isPlaying: boolean) => {
    if (isPlaying && !currentStretch.value) {
      // Start playing - begin new stretch
      startStretch(duration);
    } else if (!isPlaying && currentStretch.value) {
      // While paused - keep stretch but don't add event
      return;
    } else if (isPlaying && currentStretch.value) {
      // Update end duration for active stretch
      currentStretch.value.end_time = new Date();
      currentStretch.value.end_duration = duration;
    }
  };

  /**
   * End active stretch and get only NEW stretches for heartbeat
   * This ensures we don't send empty arrays by including any active viewing,
   * but only returns stretches that haven't been sent previously
   */
  const endActiveStretchAndGetNewStretches = (
    currentVideoTime: number
  ): IWatchStretch[] => {
    if (currentStretch.value) {
      // End the current stretch with the current video time
      currentStretch.value.end_time = new Date();
      currentStretch.value.end_duration = currentVideoTime;

      // Only add stretches that have meaningful duration (> 1 second)
      const stretchDuration =
        currentVideoTime - currentStretch.value.start_duration;
      if (stretchDuration >= 1) {
        watchStretches.value.push({ ...currentStretch.value });
      }

      // Clear the active stretch
      currentStretch.value = null;
    }

    // Return only stretches that haven't been sent yet
    return watchStretches.value.filter(
      (stretch) =>
        !sentStretches.value.some(
          (sent) =>
            sent.start_time.getTime() === stretch.start_time.getTime() &&
            sent.end_time.getTime() === stretch.end_time.getTime() &&
            sent.start_duration === stretch.start_duration &&
            sent.end_duration === stretch.end_duration
        )
    );
  };

  /**
   * Mark stretches as sent (called after successful heartbeat)
   */
  const markStretchesAsSent = (sentStretchesList: IWatchStretch[]) => {
    // Add the sent stretches to our sent list
    sentStretches.value.push(...sentStretchesList);
  };

  /**
   * Get current watch stretches for heartbeat
   */
  const getWatchStretches = (): IWatchStretch[] => {
    return watchStretches.value;
  };

  /**
   * Get all watch stretches including current active one
   */
  const getAllStretches = (): IWatchStretch[] => {
    if (currentStretch.value) {
      return [...watchStretches.value, currentStretch.value];
    }
    return watchStretches.value;
  };

  /**
   * Clear all recorded data
   */
  const clearData = () => {
    watchStretches.value = [];
    sentStretches.value = [];
    currentStretch.value = null;
    eventHistory.value = [];
  };

  /**
   * Reset for new content
   */
  const reset = () => {
    clearData();
  };

  /**
   * Add event to history for debugging
   */
  const addEvent = (event: WatchEvent) => {
    eventHistory.value.push(event);

    // Keep only last 100 events to prevent memory issues
    if (eventHistory.value.length > 100) {
      eventHistory.value = eventHistory.value.slice(-100);
    }
  };

  return {
    // State
    watchStretches: computed(() => watchStretches.value),
    currentStretch: computed(() => currentStretch.value),
    eventHistory: computed(() => eventHistory.value),

    // Computed
    hasActiveStretch,
    totalWatchStretches,

    // Methods
    startStretch,
    endStretch,
    recordPlay,
    recordPause,
    recordSeek,
    recordTimeUpdate,
    getWatchStretches,
    endActiveStretchAndGetNewStretches,
    markStretchesAsSent,
    getAllStretches,
    clearData,
    reset,
  };
}
