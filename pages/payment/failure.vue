<template>
  <div class="min-h-screen bg-body flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Error Card -->
      <div
        class="bg-cardgray rounded-lg p-8 text-center border border-red-500/20"
      >
        <!-- Error Icon -->
        <div
          class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
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
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>

        <!-- Error Message -->
        <h1 class="text-2xl font-bold text-white mb-4">Payment Failed</h1>
        <p class="text-gray-400 mb-6">
          We're sorry, but your payment could not be processed. Please try again
          or contact support if the problem persists.
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <button
            @click="redirectToProfile"
            class="bg-gold hover:bg-[#CE8F00] text-black px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Back to Profile
          </button>
          <button
            @click="retryPayment"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-6 text-center">
        <p class="text-gray-500 text-sm">
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page meta
definePageMeta({
  layout: false, // No layout for this page
});

// Redirect function
function redirectToProfile() {
  navigateTo("/profile");
}

// Retry payment function
function retryPayment() {
  // Go back to profile where user can try again
  navigateTo("/profile");
}
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
