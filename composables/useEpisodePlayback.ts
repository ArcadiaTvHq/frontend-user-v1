import { ref, computed } from "vue";

/**
 * Composable to manage episode playback state
 * Keeps episode information in state instead of using episode slugs in routes
 */
export const useEpisodePlayback = () => {
  // Current episode being played (for series)
  const currentEpisode = ref<any>(null);
  const currentSeries = ref<any>(null);

  // Set episode to play
  const setEpisode = (episode: any, series: any) => {
    currentEpisode.value = episode;
    currentSeries.value = series;
  };

  // Clear episode state
  const clearEpisode = () => {
    currentEpisode.value = null;
    currentSeries.value = null;
  };

  // Check if we have an episode selected
  const hasEpisode = computed(() => !!currentEpisode.value);

  // Get episode ID
  const episodeId = computed(() => currentEpisode.value?.id || null);

  // Get series slug for navigation
  const seriesSlug = computed(() => currentSeries.value?.slug || null);

  return {
    currentEpisode,
    currentSeries,
    setEpisode,
    clearEpisode,
    hasEpisode,
    episodeId,
    seriesSlug,
  };
};
