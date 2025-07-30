<template>
  <section
    class="bg-body text-textprimary px-4 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-center font-mont gap-8 lg:gap-16"
  >
    <div class="flex flex-1 flex-col items-center max-w-[600px] lg:items-start">
      <h1
        class="font-bold text-[28px] md:text-[36px] lg:text-[44px] text-center lg:text-left mb-4 lg:mb-6"
      >
        Frequently Asked
        <span class="text-gold">Questions & Answers</span>
      </h1>
      <p
        class="text-base md:text-normal font-medium text-center lg:text-left mb-8 lg:mb-12 opacity-90"
      >
        Whether you're here to stream blockbuster movies or upload your own
        content, these answers will help you get the most out of Arcadia TV.
      </p>
      <img
        class="hidden lg:block w-[280px] xl:w-[440px] hover:scale-110 transition-transform duration-200"
        src="../../assets/Decoration.png"
        alt="Decoration"
      />
    </div>

    <div
      class="flex flex-col gap-2 w-full lg:w-1/2 max-w-[624px] mx-auto lg:mx-0 px-2 sm:px-0 faq-container"
    >
      <FaqItem
        v-for="(faq, index) in faqItems"
        :key="index"
        :is-open="activeIndex === index"
        :question="faq.question"
        :answer="faq.answer"
        @update:isOpen="handleToggle(index, $event)"
        class="faq-item"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import FaqItem from "./FaqItem.vue";

const activeIndex = ref(-1);

const handleToggle = (index, isOpen) => {
  activeIndex.value = isOpen ? index : -1;
};

const faqItems = [
  {
    question: "What is Arcadia TV?",
    answer:
      "Arcadia TV is a streaming platform that offers a wide variety of movies, TV shows, and original content. We provide high-quality entertainment with flexible subscription options.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We offer different subscription tiers starting from free. Our paid plans start at ₦500/month with additional features and benefits.",
  },
  {
    question: "Can I watch on multiple devices?",
    answer:
      "Yes! You can stream on multiple devices depending on your subscription plan. Check our pricing section for specific device limits.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, we offer a 7-day free trial on all paid plans. You can cancel anytime during the trial period with no charges.",
  },
];
</script>

<style scoped>
.hover\:scale-125:hover {
  transform: scale(1.1);
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

@media (max-width: 1024px) {
  .hover\:scale-125:hover {
    transform: scale(1.05);
  }
}

/* Mobile-specific FAQ improvements */
@media (max-width: 768px) {
  .faq-container {
    padding: 0 1rem;
  }

  .faq-item {
    margin-bottom: 0.75rem;
  }
}
</style>
