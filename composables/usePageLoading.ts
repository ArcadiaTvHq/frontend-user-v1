import { ref, computed, onMounted, onUnmounted } from "vue";

export const usePageLoading = (options = {}) => {
  const {
    variant = "default",
    autoStart = true,
    steps = [],
    totalDuration = 3000,
  } = options;

  const isLoading = ref(false);
  const progress = ref(0);
  const currentStep = ref(0);
  const loadingMessage = ref("");

  // Default loading steps based on variant
  const defaultSteps = computed(() => {
    switch (variant) {
      case "video":
        return [
          { progress: 20, message: "Loading video player...", duration: 400 },
          { progress: 50, message: "Preparing stream...", duration: 400 },
          { progress: 80, message: "Almost ready...", duration: 400 },
          { progress: 100, message: "Ready!", duration: 200 },
        ];
      case "content":
        return [
          { progress: 25, message: "Loading components...", duration: 600 },
          { progress: 50, message: "Fetching content...", duration: 600 },
          { progress: 75, message: "Loading images...", duration: 600 },
          { progress: 100, message: "Ready!", duration: 300 },
        ];
      case "auth":
        return [
          { progress: 30, message: "Initializing...", duration: 800 },
          { progress: 60, message: "Loading interface...", duration: 800 },
          { progress: 100, message: "Welcome!", duration: 400 },
        ];
      default:
        return [
          { progress: 20, message: "Loading application...", duration: 800 },
          { progress: 40, message: "Loading components...", duration: 800 },
          { progress: 60, message: "Fetching content...", duration: 800 },
          { progress: 80, message: "Preparing interface...", duration: 800 },
          { progress: 100, message: "Ready!", duration: 400 },
        ];
    }
  });

  const finalSteps = computed(() => {
    return steps.length > 0 ? steps : defaultSteps.value;
  });

  const hasProgress = computed(() => finalSteps.value.length > 0);
  const showSpinner = computed(() => !hasProgress.value);

  let progressInterval = null;
  let fallbackTimeout = null;

  const startLoading = () => {
    if (isLoading.value) return;

    isLoading.value = true;
    progress.value = 0;
    currentStep.value = 0;

    if (hasProgress.value) {
      startProgressLoading();
    } else {
      loadingMessage.value = "Loading...";
    }
  };

  const startProgressLoading = () => {
    const steps = finalSteps.value;
    if (steps.length === 0) return;

    // Set initial step
    const firstStep = steps[0];
    progress.value = firstStep.progress;
    loadingMessage.value = firstStep.message;

    let stepIndex = 0;

    progressInterval = setInterval(() => {
      stepIndex++;

      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        progress.value = step.progress;
        loadingMessage.value = step.message;
        currentStep.value = stepIndex;
      } else {
        // All steps completed
        clearInterval(progressInterval);
        progressInterval = null;

        // Hide loading after a short delay
        setTimeout(() => {
          stopLoading();
        }, 500);
      }
    }, steps[0].duration || 800);

    // Fallback timeout to prevent infinite loading
    fallbackTimeout = setTimeout(() => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      stopLoading();
    }, totalDuration);
  };

  const stopLoading = () => {
    isLoading.value = false;

    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (fallbackTimeout) {
      clearTimeout(fallbackTimeout);
      fallbackTimeout = null;
    }
  };

  const setProgress = (newProgress, message) => {
    progress.value = Math.min(100, Math.max(0, newProgress));
    if (message) {
      loadingMessage.value = message;
    }
  };

  const setMessage = (message) => {
    loadingMessage.value = message;
  };

  // Auto-start loading if enabled
  if (autoStart) {
    onMounted(() => {
      startLoading();
    });
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopLoading();
  });

  return {
    // State
    isLoading: readonly(isLoading),
    progress: readonly(progress),
    currentStep: readonly(currentStep),
    loadingMessage: readonly(loadingMessage),

    // Computed
    hasProgress,
    showSpinner,

    // Methods
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
  };
};
