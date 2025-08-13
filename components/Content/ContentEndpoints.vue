<template>
  <div class="content-endpoints-demo">
    <h2 class="text-2xl font-bold mb-6">Content Endpoints Demo</h2>

    <!-- Featured Content -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Featured Content</h3>
      <div v-if="featuredLoading" class="text-gray-500">
        Loading featured content...
      </div>
      <div v-else-if="featuredError" class="text-red-500">
        Error: {{ featuredError }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="content in featuredContent"
          :key="content.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h4 class="font-medium">{{ content.title }}</h4>
          <p class="text-sm text-gray-600">{{ content.description }}</p>
        </div>
      </div>
    </div>

    <!-- Anticipated Content -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Anticipated Content</h3>
      <div v-if="anticipatedLoading" class="text-gray-500">
        Loading anticipated content...
      </div>
      <div v-else-if="anticipatedError" class="text-red-500">
        Error: {{ anticipatedError }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="content in anticipatedContent"
          :key="content.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h4 class="font-medium">{{ content.title }}</h4>
          <p class="text-sm text-gray-600">{{ content.description }}</p>
        </div>
      </div>
    </div>

    <!-- Recommended Content -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Recommended Content</h3>
      <div v-if="recommendedLoading" class="text-gray-500">
        Loading recommended content...
      </div>
      <div v-else-if="recommendedError" class="text-red-500">
        Error: {{ recommendedError }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="content in recommendedContent"
          :key="content.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h4 class="font-medium">{{ content.title }}</h4>
          <p class="text-sm text-gray-600">{{ content.description }}</p>
        </div>
      </div>
    </div>

    <!-- Similar Content (requires slug) -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Similar Content</h3>
      <div class="mb-4">
        <input
          v-model="similarContentSlug"
          placeholder="Enter content slug"
          class="border rounded px-3 py-2 mr-2"
        />
        <button
          @click="fetchSimilarContent"
          :disabled="!similarContentSlug || similarLoading"
          class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {{ similarLoading ? "Loading..." : "Fetch Similar" }}
        </button>
      </div>
      <div v-if="similarError" class="text-red-500">
        Error: {{ similarError }}
      </div>
      <div
        v-else-if="similarContent.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="content in similarContent"
          :key="content.id"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h4 class="font-medium">{{ content.title }}</h4>
          <p class="text-sm text-gray-600">{{ content.description }}</p>
        </div>
      </div>
    </div>

    <!-- Trailer URL by Slug -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Trailer URL by Slug</h3>
      <div class="mb-4">
        <input
          v-model="trailerSlug"
          placeholder="Enter content slug"
          class="border rounded px-3 py-2 mr-2"
        />
        <button
          @click="fetchTrailerUrl"
          :disabled="!trailerSlug || trailerLoading"
          class="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {{ trailerLoading ? "Loading..." : "Get Trailer URL" }}
        </button>
      </div>
      <div v-if="trailerError" class="text-red-500">
        Error: {{ trailerError }}
      </div>
      <div v-else-if="trailerUrl" class="border rounded p-4 bg-gray-50">
        <p class="font-medium">Trailer URL:</p>
        <a
          :href="trailerUrl"
          target="_blank"
          class="text-blue-500 hover:underline break-all"
        >
          {{ trailerUrl }}
        </a>
        <p class="text-sm text-gray-600 mt-2">
          Expires in: {{ trailerExpiresIn }} seconds
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContentService } from "~/api/services/content.service";
import type {
  ContentListResponse,
  SignedUrlResponse,
} from "~/src/types/content";

// State for featured content
const featuredContent = ref([]);
const featuredLoading = ref(false);
const featuredError = ref(null);

// State for anticipated content
const anticipatedContent = ref([]);
const anticipatedLoading = ref(false);
const anticipatedError = ref(null);

// State for recommended content
const recommendedContent = ref([]);
const recommendedLoading = ref(false);
const recommendedError = ref(null);

// State for similar content
const similarContent = ref([]);
const similarLoading = ref(false);
const similarError = ref(null);
const similarContentSlug = ref("");

// State for trailer URL
const trailerUrl = ref("");
const trailerLoading = ref(false);
const trailerError = ref(null);
const trailerExpiresIn = ref(0);
const trailerSlug = ref("");

// Fetch featured content
const fetchFeaturedContent = async () => {
  try {
    featuredLoading.value = true;
    featuredError.value = null;
    const response = await ContentService.getFeaturedContent();
    featuredContent.value = response.data;
  } catch (error: any) {
    featuredError.value = error?.message || "Failed to fetch featured content";
  } finally {
    featuredLoading.value = false;
  }
};

// Fetch anticipated content
const fetchAnticipatedContent = async () => {
  try {
    anticipatedLoading.value = true;
    anticipatedError.value = null;
    const response = await ContentService.getAnticipatedContent();
    anticipatedContent.value = response.data;
  } catch (error: any) {
    anticipatedError.value =
      error?.message || "Failed to fetch anticipated content";
  } finally {
    anticipatedLoading.value = false;
  }
};

// Fetch recommended content
const fetchRecommendedContent = async () => {
  try {
    recommendedLoading.value = true;
    recommendedError.value = null;
    const response = await ContentService.getRecommendedContent();
    recommendedContent.value = response.data;
  } catch (error: any) {
    recommendedError.value =
      error?.message || "Failed to fetch recommended content";
  } finally {
    recommendedLoading.value = false;
  }
};

// Fetch similar content
const fetchSimilarContent = async () => {
  if (!similarContentSlug.value.trim()) return;

  try {
    similarLoading.value = true;
    similarError.value = null;
    const response = await ContentService.getSimilarContent(
      similarContentSlug.value.trim()
    );
    similarContent.value = response.data;
  } catch (error: any) {
    similarError.value = error?.message || "Failed to fetch similar content";
  } finally {
    similarLoading.value = false;
  }
};

// Fetch trailer URL by slug
const fetchTrailerUrl = async () => {
  if (!trailerSlug.value.trim()) return;

  try {
    trailerLoading.value = true;
    trailerError.value = null;
    const response = await ContentService.getTrailerUrlBySlug(
      trailerSlug.value.trim()
    );
    trailerUrl.value = response.url;
    trailerExpiresIn.value = response.expires_in_seconds;
  } catch (error: any) {
    trailerError.value = error?.message || "Failed to fetch trailer URL";
  } finally {
    trailerLoading.value = false;
  }
};

// Fetch all content on mount
onMounted(async () => {
  await Promise.all([
    fetchFeaturedContent(),
    fetchAnticipatedContent(),
    fetchRecommendedContent(),
  ]);
});
</script>

<style scoped>
.content-endpoints-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
