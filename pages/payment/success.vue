<template>
  <div class="min-h-screen bg-body flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Success Card -->
      <div class="bg-cardgray rounded-lg p-8 text-center border border-gold/20">
        <!-- Success Icon -->
        <div
          class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <!-- Success Message -->
        <h1 class="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
        <p class="text-gray-400 mb-6">
          Your subscription has been activated successfully. You now have access
          to premium features.
        </p>

        <!-- Loading Spinner -->
        <div class="flex items-center justify-center mb-4">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"
          ></div>
        </div>

        <!-- Redirect Message -->
        <p class="text-sm text-gray-500">
          Redirecting to your profile in
          {{ `${countdown && countdown > 0 ? countdown : 0}` }} seconds...
        </p>

        <!-- Manual Redirect Button -->
        <button
          @click="redirectToProfile"
          class="mt-6 bg-gold hover:bg-[#CE8F00] text-black px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Go to Profile Now
        </button>
      </div>

      <!-- Additional Info -->
      <div class="mt-6 text-center">
        <p class="text-gray-500 text-sm">
          If you have any questions about your subscription, please contact
          support.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Page meta
definePageMeta({
  layout: false, // No layout for this page
});

// Reactive data
const countdown = ref(5);
let countdownInterval = null;

// Redirect function
function redirectToProfile() {
  // Clear stored payment data
  localStorage.removeItem("payment_reference");
  localStorage.removeItem("payment_access_code");
  navigateTo("/profile");
}

// Start countdown
function startCountdown() {
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      // stop countdown
      clearInterval(countdownInterval);
      countdownInterval = null;
      redirectToProfile();
    }
  }, 1000);
}

// Lifecycle hooks
onMounted(() => {
  // Start countdown when component mounts
  startCountdown();
});

onUnmounted(() => {
  // Clear interval when component unmounts
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-cardgray {
  animation: fadeIn 0.6s ease-out;
}
</style>
