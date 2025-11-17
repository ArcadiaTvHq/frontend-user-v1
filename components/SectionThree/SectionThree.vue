<template>
  <section
    class="text-textprimary font-orbitron flex flex-col items-center mt-16 px-4 md:px-8 overflow-x-hidden trigger"
  >
    <h1 class="text-[24px] md:text-normal lg:text-medium mb-4">
      Arcadia Membership
    </h1>
    <p
      class="text-smallest md:text-small text-center font-orbitron max-w-[800px] mb-8"
    >
      Choose the perfect subscription plan for your streaming needs
    </p>
    <div
      class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[900px] place-items-center"
    >
      <Card
        v-for="(subscription, index) in subscriptions"
        :key="subscription.id"
        :type="subscription.name"
        :logo="getLogoForSubscription(subscription)"
        :price="formatPrice(subscription.price)"
        :priceStyling="getPriceStyling(subscription)"
        :button="getButtonStyling(subscription)"
        :class="getCardClass(subscription, index)"
        :benefits="mapSubscriptionToBenefits(subscription)"
        :typeclass="getTypeClass(subscription)"
        :showButton="isAuthenticated"
      />
    </div>

    <!-- Single CTA for non-authenticated users -->
    <div
      v-if="!isAuthenticated"
      class="mt-8 w-full max-w-[900px] flex justify-center"
    >
      <NuxtLink
        to="/signup"
        class="bg-[#FFD005] hover:bg-[#CE8F00] text-black font-orbitron font-extrabold px-10 py-4 rounded-lg transition-all duration-300 text-center text-lg"
      >
        Get Started
      </NuxtLink>
    </div>

    <p
      class="text-center text-smallest md:text-small mt-16 md:mt-20 lg:mt-24 mb-10 md:mb-15 lg:mb-50 font-orbitron max-w-[800px]"
    >
      <template v-if="!isAuthenticated">
        Get ready for an incredible movie streaming journey with Arcadia.
        <NuxtLink
          to="/signup"
          class="underline text-[#FFD005] cursor-pointer hover:text-[#CE8F00] transition-colors"
          >Sign up</NuxtLink
        >
        today and let the entertainment begin!
      </template>
      <template v-else>
        Enjoy unlimited entertainment with Arcadia! Your premium streaming
        experience awaits.
      </template>
    </p>
  </section>
</template>

<style>
.cardbtn {
  transition: all 0.3s ease;
}

.cardbtn:hover {
  transform: scale(1.05);
  color: #000;
  background-color: #ce8f00;
}

.cardbtngold {
  transition: all 0.3s ease;
}

.cardbtngold:hover {
  transform: scale(1.05);
  background-color: #ce8f00;
}

@media (max-width: 1024px) {
  .cardbtn:hover,
  .cardbtngold:hover {
    transform: scale(1.02);
  }
}

.premium-card img {
  filter: brightness(0) saturate(100%) invert(83%) sepia(31%) saturate(638%)
    hue-rotate(359deg) brightness(103%) contrast(107%);
}
</style>

<script setup>
import cross from "@/assets/cross.png";
import checked from "@/assets/Vector.png";
import free from "../../assets/award.png";
import premium from "../../assets/king.png";
import standard from "../../assets/standard.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SubscriptionService } from "~/api/services/subscription.service";
import { useAuthStore } from "~/stores/auth";

// Get auth store to check if user is logged in
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Define reactive data
const subscriptions = ref([]);

// Fetch subscriptions on mount
onMounted(async () => {
  try {
    const response = await SubscriptionService.getSubscriptions();
    subscriptions.value = response.data || [];
  } catch (error) {
    subscriptions.value = [];
  }

  // Initialize GSAP animations
  gsap.registerPlugin(ScrollTrigger);
  const trigger = document.querySelector(".trigger");
  const slideLeft = document.querySelector(".slide-left");
  const slideRight = document.querySelector(".slide-right");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: "top bottom",
      end: "bottom 90%",
    },
    duration: 2,
  });

  if (slideLeft) {
    tl.fromTo(
      slideLeft,
      {
        xPercent: 90,
        scale: 0.8,
        opacity: 0,
      },
      {
        xPercent: 0,
        scale: 1,
        opacity: 1,
      }
    );
  }

  if (slideRight) {
    tl.fromTo(
      slideRight,
      {
        xPercent: -90,
        scale: 0.8,
        opacity: 0,
      },
      {
        xPercent: 0,
        scale: 1,
        opacity: 1,
      },
      "<"
    );
  }
});

// Map subscription to benefits array
const mapSubscriptionToBenefits = (subscription) => {
  return [
    {
      text: `${subscription.rules.video_quality} streaming content`,
      included: subscription.rules.video_quality !== "SD",
    },
    {
      text: "No playtime ads",
      included: !subscription.rules.inplay_ads,
    },
    {
      text: "No pause ads",
      included: !subscription.rules.pause_ads,
    },
    {
      text: "International Content",
      included: subscription.rules.international_content,
    },
  ];
};

// Helper functions for subscription configuration
const getLogoForSubscription = (subscription) => {
  const name = subscription.name.toLowerCase();
  if (name === "premium") return premium;
  return free;
};

const getPriceStyling = (subscription) => {
  const name = subscription.name.toLowerCase();
  let base =
    "text-[20px] md:text-normal font-semibold mb-3 md:mb-[10px] lg:text-smedium";
  if (name === "premium") {
    return base + " text-gold";
  }
  return base;
};

const getButtonStyling = (subscription) => {
  const name = subscription.name.toLowerCase();
  if (name === "premium") {
    return "h-13 w-full md:h-17 rounded-[8px] mb-[18px] cursor-pointer bg-[#FFD005] text-black hover:bg-[#CE8F00] transition-all duration-300 px-6 py-3 font-extrabold";
  } else if (name === "standard") {
    return "border-[0.85px] text-gold border-[#FFD005] hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-13 w-full md:h-17 rounded-[8px] mb-[18px] cursor-pointer transition-all duration-300 px-6 py-3 font-extrabold";
  } else {
    return "border-[0.85px] border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-13 w-full md:h-17 rounded-[8px] mb-[18px] cursor-pointer transition-all duration-300 px-6 py-3 font-extrabold";
  }
};

const getCardClass = (subscription, index) => {
  const name = subscription.name.toLowerCase();
  let base = "w-full";

  if (index === 0) {
    base += " slide-left";
  } else if (index === subscriptions.value.length - 1) {
    base += " slide-right";
    if (name === "premium") {
      base += " premium-card";
    }
  }

  return base;
};

const getTypeClass = (subscription) => {
  const name = subscription.name.toLowerCase();
  if (name === "premium") {
    return "text-type font-medium md:text-[21px] text-gold";
  } else if (name === "standard") {
    return "text-type font-medium md:text-[21px] text-white";
  }
  return "text-type font-medium md:text-[21px]";
};

// Format price with currency
const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  return `₦${numPrice.toLocaleString("en-NG")}`;
};
</script>