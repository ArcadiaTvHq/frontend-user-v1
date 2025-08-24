import { ref, computed } from "vue";

export const usePageError = () => {
  const error = ref(null);
  const isRetrying = ref(false);
  const retryCount = ref(0);
  const maxRetries = ref(3);

  const hasError = computed(() => error.value !== null);
  const canRetry = computed(() => retryCount.value < maxRetries.value);

  const setError = (errorInfo) => {
    if (typeof errorInfo === "string") {
      error.value = {
        message: errorInfo,
        timestamp: new Date().toISOString(),
        type: "GENERAL_ERROR",
      };
    } else {
      error.value = {
        ...errorInfo,
        timestamp: errorInfo.timestamp || new Date().toISOString(),
      };
    }
  };

  const clearError = () => {
    error.value = null;
    retryCount.value = 0;
  };

  const handleRetry = async (retryFunction) => {
    if (!canRetry.value || isRetrying.value) return;

    isRetrying.value = true;
    retryCount.value++;

    try {
      await retryFunction();
      clearError(); // Clear error on successful retry
    } catch (retryError) {
      console.error("Retry failed:", retryError);

      // Set new error or update existing one
      if (typeof retryError === "string") {
        setError(retryError);
      } else if (retryError instanceof Error) {
        setError({
          message: retryError.message,
          code: "RETRY_FAILED",
          type: "RETRY_ERROR",
          originalError: retryError.message,
        });
      } else {
        setError({
          message: "Retry failed. Please try again.",
          code: "RETRY_FAILED",
          type: "RETRY_ERROR",
        });
      }
    } finally {
      isRetrying.value = false;
    }
  };

  const handleApiError = (apiError) => {
    console.error("API Error:", apiError);

    let errorInfo = {
      timestamp: new Date().toISOString(),
    };

    if (apiError.response) {
      // Server responded with error status
      const status = apiError.response.status;
      const data = apiError.response.data;

      errorInfo.code = status;
      errorInfo.message = data?.message || `Server error (${status})`;

      switch (status) {
        case 400:
          errorInfo.type = "BAD_REQUEST";
          errorInfo.message =
            data?.message || "Invalid request. Please check your input.";
          break;
        case 401:
          errorInfo.type = "UNAUTHORIZED";
          errorInfo.message = "Authentication required. Please log in again.";
          break;
        case 403:
          errorInfo.type = "FORBIDDEN";
          errorInfo.message =
            "Access denied. You don't have permission for this action.";
          break;
        case 404:
          errorInfo.type = "NOT_FOUND";
          errorInfo.message = "The requested resource was not found.";
          break;
        case 429:
          errorInfo.type = "RATE_LIMITED";
          errorInfo.message =
            "Too many requests. Please wait a moment and try again.";
          break;
        case 500:
          errorInfo.type = "SERVER_ERROR";
          errorInfo.message = "Server error. Please try again later.";
          break;
        case 502:
        case 503:
        case 504:
          errorInfo.type = "SERVICE_UNAVAILABLE";
          errorInfo.message =
            "Service temporarily unavailable. Please try again later.";
          break;
        default:
          errorInfo.type = "HTTP_ERROR";
          errorInfo.message =
            data?.message || `Error ${status}: ${apiError.response.statusText}`;
      }
    } else if (apiError.request) {
      // Request was made but no response received
      errorInfo.type = "NETWORK_ERROR";
      errorInfo.message =
        "Network error. Please check your connection and try again.";
      errorInfo.code = "NETWORK_ERROR";
    } else {
      // Something else happened
      errorInfo.type = "UNKNOWN_ERROR";
      errorInfo.message = apiError.message || "An unexpected error occurred.";
      errorInfo.code = "UNKNOWN_ERROR";
    }

    setError(errorInfo);
  };

  const handleNetworkError = (networkError) => {
    console.error("Network Error:", networkError);

    setError({
      type: "NETWORK_ERROR",
      message:
        "Network connection failed. Please check your internet connection and try again.",
      code: "NETWORK_ERROR",
      timestamp: new Date().toISOString(),
    });
  };

  const handleValidationError = (validationError) => {
    console.error("Validation Error:", validationError);

    setError({
      type: "VALIDATION_ERROR",
      message: "Please check your input and try again.",
      code: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
      originalError: validationError.message || "Validation failed",
    });
  };

  return {
    // State
    error: readonly(error),
    isRetrying: readonly(isRetrying),
    retryCount: readonly(retryCount),
    maxRetries: readonly(maxRetries),

    // Computed
    hasError,
    canRetry,

    // Methods
    setError,
    clearError,
    handleRetry,
    handleApiError,
    handleNetworkError,
    handleValidationError,
  };
};
