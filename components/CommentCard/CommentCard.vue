<template>
  <div class="bg-[#1a1a1a] gap-4 flex flex-col py-6 px-8 rounded-[20px]">
    <!-- Rating Display -->
    <div v-if="comment.rating" class="flex items-center">
      <div class="flex">
        <span v-for="i in 5" :key="i" class="text-base leading-none">
          <span class="text-yellow-400" v-if="i <= comment.rating">★</span>
          <span class="text-gray-600" v-else>★</span>
        </span>
      </div>
    </div>

    <!-- User Name -->
    <h1 class="text-white font-semibold">{{ getDisplayName() }}</h1>

    <!-- Comment Text -->
    <p class="text-gray-300 leading-relaxed">
      {{ comment.comment }}
    </p>

    <!-- Review Text (if available) -->
    <div
      v-if="comment.review"
      class="bg-gray-800 p-3 rounded-lg border-l-4 border-gold"
    >
      <p class="text-sm text-gray-200 italic">{{ comment.review }}</p>
    </div>

    <!-- Post Meta Information -->
    <div class="flex items-center gap-2 text-xs text-gray-500">
      <p>Posted on {{ formatDate(comment.created_at) }}</p>
      <span v-if="comment.is_edited" class="text-blue-400">• Edited</span>
    </div>

    <!-- Replies Count -->
    <div v-if="comment.replies && comment.replies.length > 0" class="mt-2">
      <button class="text-gold text-sm hover:underline" @click="toggleReplies">
        {{ showReplies ? "Hide" : "View" }} {{ comment.replies.length }}
        {{ comment.replies.length === 1 ? "reply" : "replies" }}
      </button>

      <!-- Replies -->
      <div
        v-if="showReplies"
        class="mt-4 ml-4 space-y-3 border-l-2 border-gray-700 pl-4"
      >
        <CommentCard
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Comment } from "~/src/types/content";

const props = defineProps<{
  comment: Comment;
}>();

const showReplies = ref(false);

const getDisplayName = () => {
  const firstName = props.comment.user.first_name;
  const lastName = props.comment.user.last_name;
  return `${firstName} ${lastName?.charAt(0).toUpperCase()}.`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const toggleReplies = () => {
  showReplies.value = !showReplies.value;
};
</script>