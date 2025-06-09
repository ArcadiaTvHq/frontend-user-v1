<template>
  <Modal />
  <Navbar />
  <main
    class="bg-body flex flex-col gap-8 md:gap-16 lg:gap-20 pt-[60px] sm:pt-[75px] md:pt-[92px]"
  >
    <SectionOne
      text="Be the First to Stream ARCADIA"
      small="Join the waitlist and get exclusive early access to the next generation of streaming. Premium entertainment, zero interruptions"
      button="Join the waitlist"
      :posters="featuredPosters"
      :loading="featuredLoading"
      :error="featuredError"
      @update:posters="updateFeaturedPosters"
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
      slug: content.slug,
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
      { id: 1, image: "/images/default-poster-1.jpg", slug: "default-1" },
      { id: 2, image: "/images/default-poster-2.jpg", slug: "default-2" },
      { id: 3, image: "/images/default-poster-3.jpg", slug: "default-3" },
      { id: 4, image: "/images/default-poster-4.jpg", slug: "default-4" },
      { id: 5, image: "/images/default-poster-5.jpg", slug: "default-5" },
    ];
  } finally {
    featuredLoading.value = false;
  }
};

// Fetch data when component mounts
onMounted(async () => {
  await fetchFeaturedContent();
});
</script>