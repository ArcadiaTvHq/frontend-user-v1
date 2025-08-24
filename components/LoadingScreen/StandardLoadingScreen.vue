<template>
  <div class="standard-loading-screen">
    <div class="loading-content">
      <div class="logo-container">
        <img
          class="logo animate-pulse"
          src="@/assets/logo2.png"
          alt="Arcadia"
        />
      </div>

      <h1 class="loading-title">{{ title }}</h1>

      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">{{ progressText }}</p>
      </div>

      <div v-else-if="showSpinner" class="spinner-container">
        <div class="spinner"></div>
        <p class="spinner-text">{{ spinnerText }}</p>
      </div>

      <div v-else class="simple-loading">
        <p class="simple-text">{{ simpleText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: null, // Allow null to use smart default
  },
  showProgress: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  progressText: {
    type: String,
    default: "Loading...",
  },
  showSpinner: {
    type: Boolean,
    default: false,
  },
  spinnerText: {
    type: String,
    default: "Loading content...",
  },
  simpleText: {
    type: String,
    default: "Loading...",
  },
  variant: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "video", "content", "auth"].includes(value),
  },
});

// Detect if user is coming from external source
const isExternalNavigation = computed(() => {
  if (typeof window === "undefined") return false;

  const referrer = document.referrer;
  if (!referrer) return true; // No referrer means external or direct navigation

  try {
    const referrerUrl = new URL(referrer);
    const currentUrl = new URL(window.location.href);
    return referrerUrl.origin !== currentUrl.origin;
  } catch {
    return true; // If URL parsing fails, assume external
  }
});

// Get smart default title based on navigation type
const getSmartTitle = computed(() => {
  if (props.title) return props.title; // Use explicit title if provided

  if (isExternalNavigation.value) {
    return "Welcome to Arcadia";
  }

  // Different titles for internal navigation based on variant
  switch (props.variant) {
    case "video":
      return "Loading Video...";
    case "content":
      return "Loading Content...";
    case "auth":
      return "Initializing...";
    default:
      return "Loading...";
  }
});

// Auto-generate content based on variant
const variantContent = computed(() => {
  switch (props.variant) {
    case "video":
      return {
        title: getSmartTitle.value,
        showProgress: true,
        progressText: "Preparing video player...",
      };
    case "content":
      return {
        title: getSmartTitle.value,
        showProgress: true,
        progressText: "Fetching content...",
      };
    case "auth":
      return {
        title: getSmartTitle.value,
        showSpinner: true,
        spinnerText: "Initializing...",
      };
    default:
      return {
        title: getSmartTitle.value,
        showProgress: props.showProgress,
        showSpinner: props.showSpinner,
      };
  }
});

// Merge props with variant content
const finalProps = computed(() => ({
  ...props,
  ...variantContent.value,
}));
</script>

<style scoped>
.standard-loading-screen {
  @apply fixed inset-0 bg-black z-[99999] flex items-center justify-center;
}

.loading-content {
  @apply text-center max-w-md mx-4;
}

.logo-container {
  @apply mb-6;
}

.logo {
  @apply w-[100px] h-[100px] object-contain mx-auto;
}

.loading-title {
  @apply text-2xl font-bold text-white mb-8;
}

.progress-container {
  @apply flex flex-col items-center;
}

.progress-bar {
  @apply w-64 bg-gray-700 rounded-full h-2 mb-3;
}

.progress-fill {
  @apply bg-gold h-2 rounded-full transition-all duration-300;
}

.progress-text {
  @apply text-gray-400 text-sm;
}

.spinner-container {
  @apply flex flex-col items-center;
}

.spinner {
  @apply w-12 h-12 border-4 border-gray-700 border-t-gold rounded-full animate-spin mb-3;
}

.spinner-text {
  @apply text-gray-400 text-sm;
}

.simple-loading {
  @apply flex flex-col items-center;
}

.simple-text {
  @apply text-gray-400 text-lg font-medium;
}

/* Animation */
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

.animate-spin {
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
