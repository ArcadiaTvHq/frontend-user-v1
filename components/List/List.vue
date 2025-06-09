<template>
  <div class="flex items-center gap-2 md:gap-3 font-inter">
    <Checked
      class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
      v-if="props.ischecked"
    />
    <Cross class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" v-else />
    <p class="text-xs md:text-small text-gold" v-if="ischecked">
      {{ benefit }}
    </p>
    <p class="text-xs md:text-small opacity-75" v-else>{{ benefit }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  benefit: {
    type: String,
    required: true,
  },
  ischecked: {
    type: Boolean,
    required: true,
  },
});
</script>