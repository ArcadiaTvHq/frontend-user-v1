<template>
  <div class="min-h-screen bg-black">
    <Navbar />
    <main class="bg-black pt-[60px] sm:pt-[75px] md:pt-[92px]">
      <div v-if="content" class="container mx-auto px-4">
        <!-- Video Player -->
        <div v-if="content.trailer_upload_status === 'ready'">
          <VideoPlayer
            :key="content.id"
            :contentId="content.id"
            player-type="trailer"
          />
        </div>
        <div v-else class="w-full bg-gray-900 rounded-lg p-8 text-center mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">
            Trailer Coming Soon
          </h2>
          <p class="text-gray-400">
            We're currently processing this trailer. Please check back later.
          </p>
        </div>

        <!-- Content Detail Section -->
        <ContentDetail
          v-if="content"
          :content="content"
          :showPosterOverlay="false"
        />

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
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { ContentService } from "~/api/services/content.service";
import Navbar from "~/components/Navbar/Navbar.vue";
import VideoPlayer from "~/components/VideoPlayer/VideoPlayer.vue";
import ContentDetail from "~/components/ContentDetail/ContentDetail.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";

const route = useRoute();
const content = ref(null);
const relatedContent = ref([]);

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