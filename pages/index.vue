<template>
  <!-- <Loading/> -->
  <Modal />
  <Navbar />
  <main class="bg-body pt-[60px] sm:pt-[75px] md:pt-[92px]">
    <SectionOne
      text="Stream the Best Movies & Series Anytime, Anywhere"
      small="Enjoy unlimited movies, series, and exclusive content in stunning quality. Stream anytime, anywhere, on any device—no interruptions, just pure entertainment"
      button="Get Started"
      :posters="featuredPosters"
      :loading="featuredLoading"
      :error="featuredError"
      @update:posters="updateFeaturedPosters"
    />

    <Divider />
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
import SectionOne from "~/components/SectionOne/SectionOne.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import SectionThree from "~/components/SectionThree/SectionThree.vue";
import SectionFour from "~/components/SectionFour/SectionFour.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";
import Divider from "~/components/Divider/Divider.vue";
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";
import { buildImageUrl } from "~/src/utils/helpers";

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

// Fetch data when component mounts
onMounted(async () => {
  await Promise.all([fetchFeaturedContent(), fetchAnticipatedContent()]);
});

// Uncomment if you want to redirect to waitlist
// onMounted(() => {
//   navigateTo('/waitlist')
// })
</script>
