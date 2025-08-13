<template>
  <!-- <Loading/> -->
  <Modal />
  <Navbar />
  <main class="bg-body">
    <SectionOne
      text="Stream the Best Movies & Series Anytime, Anywhere"
      small="Enjoy unlimited movies, series, and exclusive content in stunning quality. Stream anytime, anywhere, on any device—no interruptions, just pure entertainment"
      button="Get Started"
      :posters="featuredPosters"
    />

    <!-- <Divider /> -->
    <SectionTwo
      title="Recommended"
      iconAlt="Flame icon"
      :content="recommendedContent"
      :showSeeMore="true"
      :fetchContent="false"
    />
    <SectionTwo
      title="Anticipate"
      iconAlt="Flame icon"
      :content="anticipatedContent"
      :showSeeMore="true"
      :fetchContent="false"
    />
    <SectionThree />
    <SectionFour />
    <SectionLast />
  </main>
</template>


<style>
.btn:hover {
  animation: hover-state 0.5s linear forwards;
}

@keyframes hover-state {
  to {
    transform: scale(1.05);
    background-color: var(--color-hover);
  }
}
</style>

<script setup>
import Modal from "~/components/Modal/Modal.vue";
import Navbar from "~/components/Navbar/Navbar.vue";
import HeroHome from "~/components/HeroHome/HeroHome.vue";
import SectionOne from "~/components/SectionOne/SectionOne.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import SectionThree from "~/components/SectionThree/SectionThree.vue";
import SectionFour from "~/components/SectionFour/SectionFour.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";
// import Divider from "~/components/Divider/Divider.vue";

import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";
import { useBlobImages } from "~/composables/useBlobImages";
import { useApiLoading } from "~/composables/useApiLoading";

definePageMeta({
  middleware: ["auth"],
});

// Featured content state
const featuredPosters = ref([]);
const featuredLoading = ref(true);
const featuredError = ref(null);

// Anticipated content state
const anticipatedContent = ref([]);
const anticipatedLoading = ref(true);
const anticipatedError = ref(null);

// Recommended content state
const recommendedContent = ref([]);
const recommendedLoading = ref(true);
const recommendedError = ref(null);

// Blob images composable
const { preloadContentImages } = useBlobImages();

// API loading composable
const { withApiLoading } = useApiLoading();

// Update featured posters (called from SectionOne component)
const updateFeaturedPosters = (newPosters) => {
  featuredPosters.value = newPosters;
};

// Fetch featured content
const fetchFeaturedContent = async () => {
  return withApiLoading(async () => {
    featuredLoading.value = true;
    const response = await ContentService.getFeaturedContent();

    featuredPosters.value = response.data.map((content) => ({
      id: content.id,
      slug: content.slug,
      image: content.poster_image_id || content.thumbnail_image_id,
      banner: content.banner_image_id,
      title: content.title,
      description: content.description,
    }));

    // Preload all images for featured content
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {
      console.warn("Failed to preload some featured images:", error);
    }
  });
};

// Fetch anticipated content
const fetchAnticipatedContent = async () => {
  return withApiLoading(async () => {
    try {
      anticipatedLoading.value = true;
      const response = await ContentService.getAnticipatedContent();

      anticipatedContent.value = response.data;

      // Preload all images for anticipated content
      try {
        await preloadContentImages(response.data, "public");
      } catch (error) {
        console.warn("Failed to preload some anticipated images:", error);
      }
    } catch (err) {
      anticipatedError.value = err.message;
    } finally {
      anticipatedLoading.value = false;
    }
  });
};

// Fetch recommended content
const fetchRecommendedContent = async () => {
  return withApiLoading(async () => {
    try {
      recommendedLoading.value = true;
      const response = await ContentService.getRecommendedContent();

      recommendedContent.value = response.data;

      // Preload all images for recommended content
      try {
        await preloadContentImages(response.data, "public");
      } catch (error) {
        console.warn("Failed to preload some recommended images:", error);
      }
    } catch (err) {
      recommendedError.value = err.message;
    } finally {
      recommendedLoading.value = false;
    }
  });
};

// HeroHome event handlers
const handleWatchContent = (content) => {
  console.log("Watching content:", content.title);
  // Additional logic can be added here (analytics, etc.)
};

const handleAddToList = (content) => {
  console.log("Added to list:", content.title);
  // You can add toast notification or update user's watchlist here
};

// Fetch data when component mounts
onMounted(async () => {
  await Promise.all([
    fetchFeaturedContent(),
    fetchAnticipatedContent(),
    fetchRecommendedContent(),
  ]);
});

// Uncomment if you want to redirect to waitlist
// onMounted(() => {
//   navigateTo('/waitlist')
// })
</script>
