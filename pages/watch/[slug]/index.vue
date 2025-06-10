<template>
  <div class="min-h-screen bg-black">
    <Navbar />
    <main v-if="content" class="bg-black pt-[60px] sm:pt-[75px] md:pt-[92px]">
      <!-- Background Image with Gradient Overlay -->
      <div class="relative h-[85vh] w-full">
        <img
          :src="buildImageUrl(content.banner_image_id, 'size2')"
          :alt="content.title"
          class="w-full h-full object-cover"
        />
        <!-- Enhanced gradient overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/50"
        ></div>

        <!-- Content Detail Section -->
        <ContentDetail
          :content="content"
          :showPosterOverlay="content.trailer_upload_status === 'ready'"
          class="absolute inset-0 flex items-center"
        />
      </div>

      <!-- Related Content Section -->
      <div class="container mx-auto px-4 py-8">
        <SectionTwo
          title="More Like This"
          iconAlt="Similar content icon"
          :content="relatedContent"
          :showSeeMore="false"
          :fetchContent="false"
        />
      </div>

      <!-- Conditional Footer -->
      <div class="mt-20 md:mt-32">
        <HomeFoot v-if="isAuthenticated" />
        <SectionLast v-else />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useLoadingStore } from "~/stores/loading";
import { useContentType } from "~/composables/useContentType";
import { ContentService } from "~/api/services/content.service";
import Navbar from "~/components/Navbar/Navbar.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import HomeFoot from "~/components/HomeFoot/HomeFoot.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";
import { buildImageUrl } from "~/src/utils/helpers";

const route = useRoute();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const { setContentType } = useContentType();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// State
const content = ref(null);
const relatedContent = ref([]);

// Async setup
const { data: contentData } = await useAsyncData(
  `content-${route.params.slug}`,
  () => ContentService.getContentBySlug(route.params.slug)
);

const { data: relatedData } = await useAsyncData("related-content", () =>
  ContentService.getContents({ limit: 6, page: 1 })
);

// Set content after data is loaded
watchEffect(() => {
  if (contentData.value?.data) {
    content.value = contentData.value.data;
    // Set the content type when content is loaded
    setContentType(content.value.type);
  }
  if (relatedData.value?.data) {
    relatedContent.value = relatedData.value.data;
  }
});

// Stop loading when content is ready
watchEffect(() => {
  if (content.value && relatedContent.value) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loadingStore.stopLoading();
    }, 100);
  }
});

onBeforeUnmount(() => {
  loadingStore.stopLoading();
  // Clear content type when leaving the page
  setContentType(null);
});

definePageMeta({
  middleware: ["auth", "content-loading"],
});
</script>