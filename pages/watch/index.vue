<template>
  <Navbar />
  <main class="bg-black pt-[60px] sm:pt-[75px] md:pt-[92px]">
    <HeroHome />
    <SectionTwo
      title="Anticipate"
      iconAlt="Flame icon"
      :content="anticipatedContent"
      :showSeeMore="true"
      :fetchContent="false"
    />
    <div class="mt-20 md:mt-32">
      <HomeFoot />
    </div>
  </main>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";
import Navbar from "~/components/Navbar/Navbar.vue";
import HeroHome from "~/components/HeroHome/HeroHome.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import HomeFoot from "~/components/HomeFoot/HomeFoot.vue";
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();
const userFullName = computed(() => authStore.userFullName);

const IMAGE_DELIVERY_BASE_URL =
  "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

const buildImageUrl = (imageId) => {
  if (!imageId) return "/images/default-poster.jpg";
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/size1`;
};

// Featured content state
const featuredPosters = ref([]);
const featuredLoading = ref(true);
const featuredError = ref(null);

// Anticipated content state
const anticipatedContent = ref([]);
const anticipatedLoading = ref(true);
const anticipatedError = ref(null);

// Update featured posters (called from SectionOne component)
const updateFeaturedPosters = (newPosters) => {
  featuredPosters.value = newPosters;
};

// Fetch featured content
const fetchFeaturedContent = async () => {
  try {
    featuredLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      is_featured: true,
      limit: 10,
    });

    featuredPosters.value = response.data.map((content) => ({
      id: content.id,
      image: buildImageUrl(
        content.poster_image_id || content.thumbnail_image_id
      ),
      title: content.title,
      description: content.description,
    }));
  } catch (err) {
    featuredError.value = err.message;
    // Fallback to default images if API fails
    featuredPosters.value = [
      { id: 1, image: "/images/default-poster-1.jpg" },
      { id: 2, image: "/images/default-poster-2.jpg" },
      { id: 3, image: "/images/default-poster-3.jpg" },
      { id: 4, image: "/images/default-poster-4.jpg" },
      { id: 5, image: "/images/default-poster-5.jpg" },
    ];
  } finally {
    featuredLoading.value = false;
  }
};

// Fetch anticipated content
const fetchAnticipatedContent = async () => {
  try {
    anticipatedLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      released_after: new Date().toISOString(),
      limit: 6,
      page: 1,
    });

    anticipatedContent.value = response.data;
  } catch (err) {
    anticipatedError.value = err.message;
  } finally {
    anticipatedLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    navigateTo("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Fetch data when component mounts
onMounted(async () => {
  await Promise.all([fetchFeaturedContent(), fetchAnticipatedContent()]);
});
</script>