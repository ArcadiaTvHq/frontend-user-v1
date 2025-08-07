<template>
  <Modal />
  <Navbar />
  <main class="bg-body flex flex-col gap-8 md:gap-16 lg:gap-20">
    <SectionOne
      text="Be the First to Stream ARCADIA"
      small="Join the waitlist and get exclusive early access to the next generation of streaming. Premium entertainment, zero interruptions"
      button="Join the waitlist"
      :posters="featuredPosters"
    />
    <SectionFour />
    <SectionLast />
  </main>
</template>

<script setup>
import Modal from "~/components/Modal/Modal.vue";
import Navbar from "~/components/Navbar/Navbar.vue";
import SectionOne from "~/components/SectionOne/SectionOne.vue";
import SectionFour from "~/components/SectionFour/SectionFour.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";

definePageMeta({
  middleware: ["auth"],
});

// Blob images composable
const { preloadContentImages } = useBlobImages();

// API loading composable
const { withApiLoading } = useApiLoading();

const IMAGE_DELIVERY_BASE_URL =
  "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

const buildImageUrl = (imageId) => {
  if (!imageId) return "/images/default-poster.jpg";
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/public`;
};

// Featured content state
const featuredPosters = ref([]);
const featuredLoading = ref(true);
const featuredError = ref(null);

// Update featured posters (called from SectionOne component)
const updateFeaturedPosters = (newPosters) => {
  featuredPosters.value = newPosters;
};

// Fetch featured content
const fetchFeaturedContent = async () => {
  return withApiLoading(async () => {
    featuredLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      is_featured: true,
      limit: 10,
    });

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


// Fetch data when component mounts
onMounted(async () => {
  await fetchFeaturedContent();
});
</script>