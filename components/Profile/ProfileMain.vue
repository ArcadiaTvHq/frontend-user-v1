<template>
  <div class="text-white w-full justify-center">
    <p class="text-normal">Profile Info</p>
    <div class="flex gap-13 mt-6 items-end">
      <div class="w-1/2 flex flex-col gap-2">
        <label>Display Name</label>
        <input
          class="w-full bg-cardgray h-13 border-minputb rounded-[8px] px-4"
          :placeholder="firstName + ' ' + lastName"
          :disabled="true"
        />
      </div>
      <div class="w-1/2 flex flex-col gap-2">
        <span
          ><label>Password</label
          ><button class="ml-5 text-gold" @click="modal.toggleChange">
            change
          </button></span
        >
        <input
          class="w-full bg-cardgray h-13 border-minputb rounded-[8px] px-4"
          placeholder="*****"
          :disabled="true"
        />
      </div>
    </div>
    <div class="flex justify-between items-center mt-16">
      <div class="flex flex-col">
        <p class="text-normal">Subscription info</p>
        <p class="text-smallest text-gray-400 mt-1">
          Current Plan: {{ getCurrentPlanName() }}
        </p>
      </div>
    </div>
    <div
      v-if="subscriptionStore.loading"
      class="display flex mt-8 justify-center items-center"
    >
      <p class="text-white">Loading subscription plans...</p>
    </div>
    <div
      v-else-if="subscriptionStore.error"
      class="display flex mt-8 justify-center items-center"
    >
      <p class="text-red-500">
        Error loading subscriptions: {{ subscriptionStore.error }}
      </p>
    </div>
    <div
      v-else
      class="display flex mt-8 justify-between gap-2 flex-col lg:flex-row items-center"
    >
      <Card
        v-for="subscription in availableSubscriptions"
        :key="subscription.id"
        :type="subscription.name"
        :logo="getSubscriptionLogo(subscription.name)"
        :price="formatPrice(subscription.price)"
        :priceStyling="getPriceStyling(subscription.name)"
        :button="getButtonStyling(subscription)"
        :buttonText="getButtonText(subscription)"
        :class="getCardClass(subscription.name, subscription)"
        :benefits="getSubscriptionBenefits(subscription)"
        :typeclass="getTypeClass(subscription.name)"
        :showButton="shouldShowButton(subscription)"
        @click="handleSubscriptionAction(subscription)"
      />
    </div>
    <!-- <div class="mt-6"><p>Next payment due </p></div> -->
  </div>
</template>

<script setup>
import cross from "@/assets/cross.png";
import checked from "@/assets/Vector.png";
import free from "../../assets/award.png";
import premium from "../../assets/king.png";
import standard from "../../assets/standard.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useModal } from "#imports";
import { useSubscriptionStore } from "~/stores/subscription";
import { apiClient } from "~/api/client";
import { ENDPOINTS } from "~/api/endpoints";

const subscriptionStore = useSubscriptionStore();
const modal = useModal();
const change = computed(() => modal.isChange);

const props = defineProps({
  firstName: String,
  lastName: String,
});

// Computed property for available subscriptions
const availableSubscriptions = computed(
  () => subscriptionStore.availableSubscriptions
);

// Computed property for current subscription
const currentSubscription = computed(() => subscriptionStore.currentPlan);

// Helper function to check if subscription is current (including default/free)
function isCurrentSubscription(subscription) {
  // If user has no subscription (null), they're on the default/free plan
  if (!currentSubscription.value) {
    return (
      subscription.name.toLowerCase().includes("free") ||
      subscription.is_default
    );
  }
  // Otherwise check by ID
  return currentSubscription.value.id === subscription.id;
}

// Helper function to get current plan name
function getCurrentPlanName() {
  if (currentSubscription.value) {
    return currentSubscription.value.name;
  }
  // If no subscription, find the default/free plan
  const defaultPlan = availableSubscriptions.value.find(
    (sub) => sub.name.toLowerCase().includes("free") || sub.is_default
  );
  return defaultPlan ? defaultPlan.name : "Free";
}

// Helper functions for dynamic subscription display
function getSubscriptionLogo(subscriptionName) {
  const name = subscriptionName.toLowerCase();
  if (name.includes("premium")) return premium;
  if (name.includes("standard")) return standard;
  return free;
}

function getPriceStyling(subscriptionName) {
  const name = subscriptionName.toLowerCase();
  let base =
    "text-[20px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-smedium";
  if (name.includes("premium")) {
    return base + " text-gold";
  }
  return base;
}

function getCardClass(subscriptionName, subscription) {
  const name = subscriptionName.toLowerCase();
  let base = "w-full";

  // Add current plan highlighting
  if (isCurrentSubscription(subscription)) {
    base += " border-2 border-gold";
  }

  if (name.includes("free")) {
    base += " slide-left";
  } else if (name.includes("premium")) {
    base += " slide-right premium-card";
  }

  return base;
}

function getTypeClass(subscriptionName) {
  const name = subscriptionName.toLowerCase();
  if (name.includes("premium")) {
    return "text-type font-medium md:text-[21px] text-gold";
  } else if (name.includes("standard")) {
    return "text-type font-medium md:text-[21px] text-white";
  }
  return "text-type font-medium md:text-[21px]";
}

function getButtonStyling(subscription) {
  const name = subscription.name.toLowerCase();
  const isCurrentPlan = isCurrentSubscription(subscription);

  if (isCurrentPlan) {
    return "bg-gray-600 text-white cursor-not-allowed opacity-50 h-13 w-full rounded-[8px] mb-[18px] font-extrabold";
  } else if (name.includes("premium")) {
    return "bg-[#FFD005] hover:bg-[#CE8F00] text-black h-13 w-full rounded-[8px] mb-[18px] cursor-pointer transition-all duration-300 font-extrabold";
  } else if (name.includes("standard")) {
    return "border-[0.85px] text-gold border-[#FFD005] hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-13 w-full rounded-[8px] mb-[18px] cursor-pointer transition-all duration-300 font-extrabold";
  } else {
    return "border-[0.85px] border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-13 w-full rounded-[8px] mb-[18px] cursor-pointer transition-all duration-300 font-extrabold";
  }
}

function getButtonText(subscription) {
  const isCurrentPlan = isCurrentSubscription(subscription);

  if (isCurrentPlan) {
    return "Current Plan";
  } else {
    return "Select Plan";
  }
}

function shouldShowButton(subscription) {
  // Don't show button for default/free subscriptions
  return !subscription.is_default;
}

function handleSubscriptionAction(subscription) {
  const isCurrentPlan = isCurrentSubscription(subscription);

  if (isCurrentPlan) {
    // Only allow cancellation if it's not the default/free plan
    if (currentSubscription.value && !subscription.is_default) {
      if (
        confirm(
          `Are you sure you want to cancel your ${subscription.name} subscription?`
        )
      ) {
        handleCancelSubscription();
      }
    }
  } else {
    // Handle upgrade to this plan
    handleUpgradePlan(subscription);
  }
}

function getSubscriptionBenefits(subscription) {
  const benefits = [
    {
      text: `${subscription.rules?.video_quality || "SD"} streaming content`,
      included: subscription.rules?.video_quality !== "SD",
    },
    {
      text: "No playtime ads",
      included: !subscription.rules?.inplay_ads,
    },
    {
      text: "No pause ads",
      included: !subscription.rules?.pause_ads,
    },
    {
      text: "International Content",
      included: subscription.rules?.international_content,
    },
  ];
  return benefits;
}

function formatPrice(price) {
  if (!price) return "₦0";

  // Convert string to number if needed
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // Check if it's a valid number
  if (isNaN(numericPrice)) return price;

  // Format as Nigerian Naira with proper formatting
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

// Subscription management functions
function handleUpgradePlan(subscription) {
  // Call the initialize payment endpoint
  initializePayment(subscription.id);
}

function handleCancelSubscription() {
  // TODO: Implement cancellation logic
  console.log("Cancelling subscription");
}

// Initialize payment for subscription
async function initializePayment(subscriptionId) {
  try {
    console.log("Initializing payment for subscription:", subscriptionId);
    const response = await apiClient.post(
      ENDPOINTS.SUBSCRIPTION.INITIALIZE_PAYMENT(subscriptionId)
    );
    console.log("Payment initialization response:", response);

    // Check if the response is successful and has authorization URL
    if (response.status === "success" && response.data?.authorization_url) {
      // Redirect to Paystack checkout
      window.location.href = response.data.authorization_url;
    } else {
      console.error("Invalid response format or missing authorization URL");
    }
  } catch (error) {
    console.error("Error initializing payment:", error);
  }
}

// Fetch subscriptions when component mounts
onMounted(() => {
  subscriptionStore.fetchSubscriptions();
});
</script>

<style scoped>
.premium-card img {
  filter: brightness(0) saturate(100%) invert(83%) sepia(31%) saturate(638%)
    hue-rotate(359deg) brightness(103%) contrast(107%);
}
</style>
