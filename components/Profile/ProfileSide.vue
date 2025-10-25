<template>
  <div
    class="bg-cardgray max-w-[444px] rounded-[15px] flex justify-center flex-col items-center font-orbitron card lg:h-[700px] overflow-hidden"
  >
    <div
      class="w-4/5 h-full flex flex-col justify-start items-center overflow-y-auto py-4"
    >
      <div class="text-white flex justify-center items-center flex-col w-full">
        <img
          src="../../assets/images/avatar.png"
          class="rounded-full h-[130px] w-[130px]"
        />
        <p class="text-normal">{{ firstName }} {{ lastName }}</p>
        <p>{{ email }}</p>
        <!-- <div class="mt-11 mb-8 text-center">
          <p class="font-semibold text-gold text-lg">
            {{ subscriptionDisplayName }}
          </p>
          <p class="text-gray-400 text-sm">{{ subscriptionButtonText }}</p>
        </div> -->

        <!-- Subscription Management Section
        <div v-if="currentSubscription" class="w-full px-4 mb-6">
          <div class="bg-cardgray rounded-lg p-4 border border-gray-600">
            <h3 class="text-white font-semibold mb-3 text-sm">
              Subscription Details
            </h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-400">Plan:</span>
                <span class="text-white">{{ currentSubscription.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Price:</span>
                <span class="text-white"
                  >{{ formatPrice(currentSubscription.price) }}/month</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Status:</span>
                <span class="text-green-400">{{
                  currentSubscription.is_active ? "Active" : "Inactive"
                }}</span>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Payment Methods Section -->
        <div class="w-4/5 mt-4 mb-4">
          <div class="bg-cardgray rounded-lg p-3 border border-gray-600">
            <h3 class="text-white font-semibold mb-3 text-sm">
              Payment Methods
            </h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div
                v-if="paymentCards.length === 0"
                class="text-gray-400 text-center py-4 text-xs"
              >
                No payment methods saved yet.
              </div>
              <div
                v-for="card in paymentCards"
                :key="card.id"
                class="flex items-center justify-between p-2 bg-gold/10 border border-gold/20 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-5 bg-gradient-to-r from-gold to-yellow-400 rounded flex items-center justify-center"
                  >
                    <span class="text-black text-xs font-bold">{{
                      card.brand ? card.brand.charAt(0) : "?"
                    }}</span>
                  </div>
                  <div>
                    <p class="text-white text-xs font-medium">
                      {{ card.brand }} ****{{ card.last4 }}
                    </p>
                    <p class="text-gray-400 text-xs">
                      {{ card.expiryMonth }}/{{ card.expiryYear }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    v-if="!card.isDefault"
                    class="p-1 text-gold hover:text-yellow-400 transition-colors"
                    @click="setDefaultCard(card.id)"
                    title="Set as default"
                  >
                    <svg
                      class="w-3 h-3"
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
                  </button>
                  <button
                    class="p-1 text-red-400 hover:text-red-300 transition-colors"
                    @click="removeCard(card.id)"
                    title="Remove card"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <!-- <button
              class="w-full mt-2 bg-gold hover:bg-[#CE8F00] text-black py-2 rounded text-xs transition-colors font-semibold"
              @click="addNewCard"
            >
              + Add New Card
            </button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Subscription Section - Outside scrollable area, above logout -->
    <div v-if="hasPaidSubscription" class="w-4/5 mb-4">
      <div class="bg-red-900/20 rounded-lg p-3 border border-red-600">
        <h3 class="text-white font-semibold mb-2 text-sm">
          Cancel Subscription
        </h3>
        <p class="text-gray-400 text-xs mb-2">
          Cancel your
          {{ currentSubscription && currentSubscription.name }}
          subscription. You'll lose access to premium features at the end of
          your billing period.
        </p>
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs transition-colors w-full"
          @click="handleCancelSubscription"
        >
          Cancel Subscription
        </button>
      </div>
    </div>

    <div
      class="mt-auto flex w-4/5 justify-start text-white gap-4 items-center mb-4"
    >
      <LazyIconsLogouticon />
      <p class="text-sm">Logout</p>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  .card {
    height: fit-content;
    width: 100%;
    max-width: 600px;
    padding: 5px;
    min-height: 400px;
  }
}

/* Custom scrollbar for payment methods */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 208, 5, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 208, 5, 0.7);
}
</style>

<script setup>
import { useSubscriptionStore } from "~/stores/subscription";
import { SubscriptionService } from "~/api/services/subscription.service";

const subscriptionStore = useSubscriptionStore();

const props = defineProps({
  firstName: { type: String },
  lastName: String,
  email: { type: String },
  profileimg: String,
  plan: String,
  subscription: Object, // Changed from String to Object to match Subscription interface
});

// Computed properties for dynamic subscription display
const subscriptionDisplayName = computed(() => {
  if (!props.subscription) {
    return "Free";
  }
  return props.subscription.name || "Free";
});

const subscriptionButtonText = computed(() => {
  if (!props.subscription) {
    return "Upgrade Plan";
  }
  return "Current Plan";
});

// Computed property for current subscription
const currentSubscription = computed(() => subscriptionStore.currentPlan);

// Computed property to check if user has a paid subscription
const hasPaidSubscription = computed(() => {
  return currentSubscription.value && !currentSubscription.value.is_default;
});

// Payment cards data - fetched from API
const paymentCards = ref([]);

// Fetch cards from API
async function fetchCards() {
  try {
    const response = await SubscriptionService.getCards();
    if (response.status === "success") {
      // Transform API response to match the template structure
      paymentCards.value = response.data.map((card) => ({
        id: card.id,
        brand: card.brand,
        last4: card.last4,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        isDefault: card.is_default,
      }));
    }
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
}

// Format price function
function formatPrice(price) {
  if (!price) return "₦0";
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return price;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

// Card management functions
async function setDefaultCard(cardId) {
  try {
    // Update all cards to not be default
    paymentCards.value.forEach((card) => {
      card.isDefault = false;
    });
    // Set the selected card as default
    const card = paymentCards.value.find((c) => c.id === cardId);
    if (card) {
      card.isDefault = true;
    }
    // TODO: Implement API call to set default card
    console.log("Setting card as default:", cardId);
  } catch (error) {
    console.error("Error setting default card:", error);
  }
}

async function removeCard(cardId) {
  if (confirm("Are you sure you want to remove this payment method?")) {
    try {
      const cardIndex = paymentCards.value.findIndex((c) => c.id === cardId);
      if (cardIndex > -1) {
        const card = paymentCards.value[cardIndex];
        // Don't allow removing the default card if it's the only card
        if (card.isDefault && paymentCards.value.length === 1) {
          alert(
            "Cannot remove the only payment method. Please add another card first."
          );
          return;
        }
        paymentCards.value.splice(cardIndex, 1);
        // If we removed the default card, make the first remaining card default
        if (card.isDefault && paymentCards.value.length > 0) {
          paymentCards.value[0].isDefault = true;
        }
      }
      // TODO: Implement API call to remove card
      console.log("Removing card:", cardId);
    } catch (error) {
      console.error("Error removing card:", error);
    }
  }
}

function addNewCard() {
  // TODO: Implement add new card functionality
  console.log("Adding new card");
}

function handleCancelSubscription() {
  if (
    confirm(
      `Are you sure you want to cancel your ${currentSubscription.value?.name} subscription?`
    )
  ) {
    // TODO: Implement cancel subscription logic
    console.log("Cancelling subscription");
  }
}

// Watch for subscription changes and update store
watch(
  () => props.subscription,
  (newSubscription) => {
    if (newSubscription) {
      subscriptionStore.setCurrentSubscription(newSubscription);
    }
  },
  { immediate: true }
);

// Fetch cards when component mounts
onMounted(() => {
  fetchCards();
});
</script>