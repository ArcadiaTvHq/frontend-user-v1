import { defineStore } from "pinia";
import {
  SubscriptionService,
  type Subscription,
  type SubscriptionListResponse,
} from "~/api/services/subscription.service";

export const useSubscriptionStore = defineStore(
  "subscription",
  () => {
    const subscriptions = ref<Subscription[]>([]);
    const currentSubscription = ref<Subscription | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const availableSubscriptions = computed(() => subscriptions.value);
    const currentPlan = computed(() => currentSubscription.value);
    const isPremium = computed(
      () => currentSubscription.value?.name?.toLowerCase() === "premium"
    );
    const isStandard = computed(
      () => currentSubscription.value?.name?.toLowerCase() === "standard"
    );
    const isFree = computed(
      () =>
        !currentSubscription.value ||
        currentSubscription.value?.name?.toLowerCase() === "free"
    );

    // Actions
    async function fetchSubscriptions(): Promise<void> {
      loading.value = true;
      error.value = null;
      try {
        const response: SubscriptionListResponse =
          await SubscriptionService.getSubscriptions();
        subscriptions.value = response.data;
      } catch (err: any) {
        error.value = err.message || "Failed to fetch subscriptions";
        console.error("Error fetching subscriptions:", err);
      } finally {
        loading.value = false;
      }
    }

    function setCurrentSubscription(subscription: Subscription | null): void {
      currentSubscription.value = subscription;
    }

    function getSubscriptionById(id: string): Subscription | undefined {
      return subscriptions.value.find((sub) => sub.id === id);
    }

    function getSubscriptionByName(name: string): Subscription | undefined {
      return subscriptions.value.find(
        (sub) => sub.name.toLowerCase() === name.toLowerCase()
      );
    }

    // Initialize subscriptions on store creation
    if (process.client) {
      fetchSubscriptions();
    }

    return {
      // State
      subscriptions,
      currentSubscription,
      loading,
      error,
      // Getters
      availableSubscriptions,
      currentPlan,
      isPremium,
      isStandard,
      isFree,
      // Actions
      fetchSubscriptions,
      setCurrentSubscription,
      getSubscriptionById,
      getSubscriptionByName,
    };
  },
  {
    persist: true,
  }
);
