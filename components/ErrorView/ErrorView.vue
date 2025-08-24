<template>
  <div class="error-view">
    <div class="error-content">
      <div class="error-icon">
        <svg
          class="w-16 h-16 text-red-500"
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

      <h2 class="error-title">{{ title || "Something went wrong" }}</h2>

      <p class="error-message">
        {{ message || "An unexpected error occurred. Please try again." }}
      </p>

      <div class="error-actions">
        <button
          v-if="showRetry"
          @click="handleRetry"
          class="retry-button"
          :disabled="isRetrying"
        >
          <svg
            v-if="!isRetrying"
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
          <svg
            v-else
            class="w-4 h-4 mr-2 animate-spin"
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
          {{ isRetrying ? "Retrying..." : "Retry" }}
        </button>

        <button v-if="showBack" @click="handleBack" class="back-button">
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {{ backText || "Go Back" }}
        </button>

        <button
          v-if="showRefresh"
          @click="handleRefresh"
          class="refresh-button"
          :disabled="isRefreshing"
        >
          <svg
            v-if="!isRefreshing"
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4 mr-2 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ isRefreshing ? "Refreshing..." : "Refresh Page" }}
        </button>
      </div>

      <div v-if="showErrorDetails && error" class="error-details">
        <details class="mt-4">
          <summary
            class="text-sm text-gray-400 cursor-pointer hover:text-gray-300"
          >
            Error Details
          </summary>
          <div
            class="mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 font-mono"
          >
            <div v-if="error.code">Code: {{ error.code }}</div>
            <div v-if="error.type">Type: {{ error.type }}</div>
            <div v-if="error.timestamp">
              Time: {{ new Date(error.timestamp).toLocaleString() }}
            </div>
            <div v-if="error.originalError">
              Original: {{ error.originalError }}
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "Something went wrong",
  },
  message: {
    type: String,
    default: "An unexpected error occurred. Please try again.",
  },
  error: {
    type: Object,
    default: null,
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
  showBack: {
    type: Boolean,
    default: true,
  },
  showRefresh: {
    type: Boolean,
    default: false,
  },
  backText: {
    type: String,
    default: "Go Back",
  },
  showErrorDetails: {
    type: Boolean,
    default: false,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["retry", "back", "refresh"]);

const isRetrying = ref(false);

const handleRetry = async () => {
  if (isRetrying.value) return;

  isRetrying.value = true;
  try {
    await emit("retry");
  } finally {
    isRetrying.value = false;
  }
};

const handleBack = () => {
  emit("back");
};

const handleRefresh = () => {
  emit("refresh");
};
</script>

<style scoped>
.error-view {
  @apply fixed inset-0 bg-black/95 flex items-center justify-center z-50;
}

.error-content {
  @apply text-center max-w-md mx-4 p-8 bg-gray-900 rounded-lg border border-gray-700;
}

.error-icon {
  @apply mb-6 flex justify-center;
}

.error-title {
  @apply text-2xl font-bold text-white mb-4;
}

.error-message {
  @apply text-gray-300 mb-8 leading-relaxed;
}

.error-actions {
  @apply flex flex-col sm:flex-row gap-3 justify-center;
}

.retry-button,
.back-button,
.refresh-button {
  @apply flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm;
}

.retry-button {
  @apply bg-gold hover:bg-[#CE8F00] text-black disabled:opacity-50 disabled:cursor-not-allowed;
}

.back-button {
  @apply bg-gray-700 hover:bg-gray-600 text-white;
}

.refresh-button {
  @apply bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed;
}

.error-details {
  @apply mt-6 pt-6 border-t border-gray-700;
}

.error-details summary {
  @apply text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors;
}

.error-details details[open] summary {
  @apply mb-2;
}
</style>
