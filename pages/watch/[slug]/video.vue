<template>
  <div class="min-h-screen bg-black">
    <Navbar />
    <main class="bg-black pt-[60px] sm:pt-[75px] md:pt-[92px]">
      <div v-if="content" class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl md:text-4xl text-white font-bold">
            {{ content.title }}
          </h1>
          <NuxtLink
            :to="`/watch/${content.slug}`"
            class="btn bg-[#FFD005] hover:bg-[#CE8F00] text-black px-6 py-2 rounded-lg transition-colors"
          >
            Back to Details
          </NuxtLink>
        </div>

        <div class="aspect-video w-full bg-gray-900 rounded-lg">
          <!-- Video player will go here -->
          <div
            class="w-full h-full flex items-center justify-center text-white"
          >
            <p>Video Player for: {{ content.title }}</p>
          </div>
        </div>

        <!-- Content information -->
        <div class="mt-6 text-white">
          <p class="mt-2 text-gray-300">{{ content.description }}</p>
        </div>
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
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { ContentService } from "~/api/services/content.service";
import Navbar from "~/components/Navbar/Navbar.vue";
import HomeFoot from "~/components/HomeFoot/HomeFoot.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";

const route = useRoute();
const content = ref(null);
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(async () => {
  try {
    const response = await ContentService.getContentBySlug(route.params.slug);
    content.value = response.data;
  } catch (error) {
    console.error("Error fetching content details:", error);
  }
});

definePageMeta({
  middleware: ["auth"],
});
</script>