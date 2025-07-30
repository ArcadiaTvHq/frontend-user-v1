<template>
  <Transition name="fade" mode="out-in">
    <div
      v-if="shouldShowLoader && !isInitialLoading"
      class="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <img
          class="w-[100px] h-[100px] object-contain animate-pulse mb-4"
          src="@/assets/logo2.png"
          alt="Logo"
        />
        <p v-if="routeLoading" class="text-white text-lg font-medium">
          Loading...
        </p>
        <p
          v-else-if="hasLoadingComponents"
          class="text-white text-lg font-medium"
        >
          Loading content...
        </p>
        <p v-else class="text-white text-lg font-medium">Welcome to Arcadia</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useLoadingStore } from "~/stores/loading";

const loadingStore = useLoadingStore();
const shouldShowLoader = computed(() => loadingStore.shouldShowLoader);
const routeLoading = computed(() => loadingStore.routeLoading);
const hasLoadingComponents = computed(() => loadingStore.hasLoadingComponents);

// Don't show Vue loading screen during initial load
const isInitialLoading = ref(true);
onMounted(() => {
  setTimeout(() => {
    isInitialLoading.value = false;
  }, 2500); // Wait longer than the layout loading
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
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
</style>