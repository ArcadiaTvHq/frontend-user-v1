<template>
  <div class="min-h-screen bg-black">
    <Navbar />
    <main class="bg-black pt-[60px] sm:pt-[75px] md:pt-[92px]">
      <!-- Background Image with Gradient Overlay -->
      <div v-if="content" class="relative h-[85vh] w-full">
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
          v-if="content"
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ContentService } from "~/api/services/content.service";
import Navbar from "~/components/Navbar/Navbar.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import { buildImageUrl } from "~/src/utils/helpers";

const route = useRoute();
const content = ref(null);
const relatedContent = ref([]);

// Fetch content details when component mounts
onMounted(async () => {
  try {
    console.log("Fetching content for slug:", route.params.slug);
    const response = await ContentService.getContentBySlug(route.params.slug);
    content.value = response.data;

    // Fetch related content
    const relatedResponse = await ContentService.getContents({
      limit: 6,
      page: 1,
      // exclude_ids: [content.value.id], // We can exclude current content by ID
    });
    relatedContent.value = relatedResponse.data;
  } catch (error) {
    console.error("Error fetching content details:", error);
  }
});

definePageMeta({
  middleware: ["auth"],
});
</script>