<template>
  <Transition name="fade">
    <div
      v-if="loading"
      class="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <img
        class="w-[100px] h-[100px] object-contain animate-pulse"
        src="@/assets/logo2.png"
        alt="Logo"
      />
    </div>
  </Transition>
</template>

<script setup>
const { $loading } = useNuxtApp();
const loading = computed(() => $loading.value);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0s;
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